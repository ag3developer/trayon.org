import { expect } from 'chai';
import { Deposit, Withdrawal } from '../Bridge';
import { sequelize } from '../../sequelize';

describe('Bridge Models', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  describe('Deposit Model', () => {
    it('should create deposit with pending status', async () => {
      const deposit = await Deposit.create({
        userAddress: '0x1234567890123456789012345678901234567890',
        amount: '1000000000000000000', // 1 token
        token: 'ETH',
        l1TxHash: '0xdeposittxhash123456789',
        l1BlockNumber: 18000000,
        status: 'pending'
      });

      expect(deposit.status).to.equal('pending');
      expect(deposit.l1TxHash).to.equal('0xdeposittxhash123456789');
      expect(deposit.amount).to.equal('1000000000000000000');
    });

    it('should enforce unique l1TxHash constraint', async () => {
      try {
        await Deposit.create({
          userAddress: '0x9876543210987654321098765432109876543210',
          amount: '500000000000000000',
          token: 'ETH',
          l1TxHash: '0xdeposittxhash123456789', // duplicate
          l1BlockNumber: 18000001,
          status: 'pending'
        });
        expect.fail('Should have thrown unique constraint error');
      } catch (error: any) {
        expect(error.name).to.equal('SequelizeUniqueConstraintError');
      }
    });

    it('should transition deposit from pending to confirmed', async () => {
      const deposit = await Deposit.findOne({
        where: { l1TxHash: '0xdeposittxhash123456789' }
      });

      await deposit.update({
        status: 'confirmed',
        confirmations: 12
      });

      expect(deposit.status).to.equal('confirmed');
      expect(deposit.confirmations).to.equal(12);
    });

    it('should transition deposit from confirmed to finalized', async () => {
      const deposit = await Deposit.findOne({
        where: { l1TxHash: '0xdeposittxhash123456789' }
      });

      await deposit.update({
        status: 'finalized',
        l2TxHash: '0xl2transactionhash'
      });

      expect(deposit.status).to.equal('finalized');
      expect(deposit.l2TxHash).to.equal('0xl2transactionhash');
    });

    it('should handle failed deposit with reason', async () => {
      const deposit = await Deposit.create({
        userAddress: '0x1111111111111111111111111111111111111111',
        amount: '5000000000000000000',
        token: 'USDC',
        l1TxHash: '0xfaildeposittxhash',
        l1BlockNumber: 18000001,
        status: 'failed',
        failureReason: 'Insufficient liquidity in bridge pool'
      });

      expect(deposit.status).to.equal('failed');
      expect(deposit.failureReason).to.include('Insufficient liquidity');
    });

    it('should track confirmations for deposit', async () => {
      const deposit = await Deposit.create({
        userAddress: '0x2222222222222222222222222222222222222222',
        amount: '2000000000000000000',
        token: 'ETH',
        l1TxHash: '0xconfirmationtrackinghash',
        l1BlockNumber: 18000002,
        status: 'pending',
        confirmations: 0
      });

      // Simulate confirmation tracking
      for (let i = 1; i <= 15; i++) {
        await deposit.update({ confirmations: i });
        if (i >= 12 && deposit.status === 'pending') {
          await deposit.update({ status: 'confirmed' });
        }
      }

      expect(deposit.confirmations).to.equal(15);
      expect(deposit.status).to.equal('confirmed');
    });
  });

  describe('Withdrawal Model', () => {
    it('should create withdrawal with pending status', async () => {
      const withdrawal = await Withdrawal.create({
        userAddress: '0x1234567890123456789012345678901234567890',
        amount: '1000000000000000000',
        token: 'ETH',
        l2TxHash: '0xwithdrawltxhash',
        l2BlockNumber: 5000000,
        status: 'pending'
      });

      expect(withdrawal.status).to.equal('pending');
      expect(withdrawal.l2TxHash).to.equal('0xwithdrawltxhash');
    });

    it('should enforce unique l2TxHash constraint', async () => {
      try {
        await Withdrawal.create({
          userAddress: '0x9876543210987654321098765432109876543210',
          amount: '500000000000000000',
          token: 'ETH',
          l2TxHash: '0xwithdrawltxhash', // duplicate
          l2BlockNumber: 5000001,
          status: 'pending'
        });
        expect.fail('Should have thrown unique constraint error');
      } catch (error: any) {
        expect(error.name).to.equal('SequelizeUniqueConstraintError');
      }
    });

    it('should transition withdrawal from pending to proven', async () => {
      const withdrawal = await Withdrawal.findOne({
        where: { l2TxHash: '0xwithdrawltxhash' }
      });

      const proofTimestamp = new Date();
      await withdrawal.update({
        status: 'proven',
        provenAt: proofTimestamp,
        l1TxHash: '0xl1withwithdrawtx'
      });

      expect(withdrawal.status).to.equal('proven');
      expect(withdrawal.provenAt).to.exist;
      expect(withdrawal.l1TxHash).to.equal('0xl1withwithdrawtx');
    });

    it('should transition withdrawal from proven to finalized', async () => {
      const withdrawal = await Withdrawal.findOne({
        where: { l2TxHash: '0xwithdrawltxhash' }
      });

      await withdrawal.update({
        status: 'finalized'
      });

      expect(withdrawal.status).to.equal('finalized');
    });

    it('should handle failed withdrawal with reason', async () => {
      const withdrawal = await Withdrawal.create({
        userAddress: '0x3333333333333333333333333333333333333333',
        amount: '3000000000000000000',
        token: 'USDC',
        l2TxHash: '0xfailedwithdrawaltxhash',
        l2BlockNumber: 5000001,
        status: 'failed',
        failureReason: 'Invalid withdrawal proof'
      });

      expect(withdrawal.status).to.equal('failed');
      expect(withdrawal.failureReason).to.include('Invalid');
    });

    it('should track 7-day challenge window', async () => {
      const withdrawal = await Withdrawal.create({
        userAddress: '0x4444444444444444444444444444444444444444',
        amount: '1500000000000000000',
        token: 'ETH',
        l2TxHash: '0xchallengewindowtxhash',
        l2BlockNumber: 5000002,
        status: 'submitted'
      });

      const createdAt = withdrawal.createdAt;
      const challengeWindowEnd = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);

      expect(withdrawal.status).to.equal('submitted');
      // Verify 7 day window can be calculated
      const daysToChallenge = Math.ceil(
        (challengeWindowEnd.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)
      );
      expect(daysToChallenge).to.be.lessThanOrEqual(7);
    });
  });

  after(async () => {
    await sequelize.close();
  });
});
