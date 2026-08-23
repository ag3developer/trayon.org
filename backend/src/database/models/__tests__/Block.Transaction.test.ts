import { expect } from 'chai';
import { Block, Transaction } from '../Block';
import { sequelize } from '../../sequelize';

describe('Block and Transaction Models', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  describe('Block Model', () => {
    it('should create block with correct data', async () => {
      const block = await Block.create({
        blockNumber: 18000000,
        blockHash: '0xblockhash12345',
        parentHash: '0xparenthash12345',
        stateRoot: '0xstateroot12345',
        transactionsRoot: '0xtxroot12345',
        timestamp: new Date(),
        proposer: '0xproposeraddress1234567890123456789012',
        gasUsed: '5000000',
        gasLimit: '30000000',
        transactions: 150,
        size: 45000,
        finalized: false
      });

      expect(block.blockNumber).to.equal(18000000);
      expect(block.blockHash).to.equal('0xblockhash12345');
      expect(block.transactions).to.equal(150);
    });

    it('should enforce unique blockNumber constraint', async () => {
      try {
        await Block.create({
          blockNumber: 18000000, // duplicate
          blockHash: '0xdifferentblockhash',
          parentHash: '0xparenthash12345',
          stateRoot: '0xstateroot12345',
          transactionsRoot: '0xtxroot12345',
          timestamp: new Date(),
          proposer: '0xproposeraddress1234567890123456789012',
          gasUsed: '5000000',
          gasLimit: '30000000',
          transactions: 100
        });
        expect.fail('Should have thrown unique constraint error');
      } catch (error: any) {
        expect(error.name).to.equal('SequelizeUniqueConstraintError');
      }
    });

    it('should enforce unique blockHash constraint', async () => {
      try {
        await Block.create({
          blockNumber: 18000001,
          blockHash: '0xblockhash12345', // duplicate
          parentHash: '0xparenthash12345',
          stateRoot: '0xstateroot12345',
          transactionsRoot: '0xtxroot12345',
          timestamp: new Date(),
          proposer: '0xproposeraddress1234567890123456789012',
          gasUsed: '5000000',
          gasLimit: '30000000'
        });
        expect.fail('Should have thrown unique constraint error');
      } catch (error: any) {
        expect(error.name).to.equal('SequelizeUniqueConstraintError');
      }
    });

    it('should finalize block', async () => {
      const block = await Block.findOne({
        where: { blockNumber: 18000000 }
      });

      await block.update({ finalized: true });

      expect(block.finalized).to.be.true;
    });

    it('should retrieve blocks in range', async () => {
      // Create additional blocks
      for (let i = 18000001; i <= 18000005; i++) {
        await Block.create({
          blockNumber: i,
          blockHash: `0xblockhash${i}`,
          parentHash: `0xparenthash${i - 1}`,
          stateRoot: `0xstateroot${i}`,
          transactionsRoot: `0xtxroot${i}`,
          timestamp: new Date(),
          proposer: '0xproposeraddress1234567890123456789012',
          gasUsed: '5000000',
          gasLimit: '30000000',
          transactions: 100,
          finalized: i < 18000003 // older blocks finalized
        });
      }

      const blocks = await Block.findAll({
        where: {
          blockNumber: { [sequelize.Op.between]: [18000000, 18000005] }
        },
        order: [['blockNumber', 'DESC']]
      });

      expect(blocks.length).to.equal(6);
      expect(blocks[0].blockNumber).to.equal(18000005);
    });
  });

  describe('Transaction Model', () => {
    it('should create transaction with pending status', async () => {
      const transaction = await Transaction.create({
        txHash: '0xtransactionhash123456',
        from: '0x1234567890123456789012345678901234567890',
        to: '0x0987654321098765432109876543210987654321',
        value: '1000000000000000000', // 1 token
        gasPrice: '20000000000',
        gas: '21000',
        gasUsed: '21000',
        input: '0x',
        blockNumber: 18000000,
        blockHash: '0xblockhash12345',
        transactionIndex: 0,
        status: 'pending',
        type: 'transfer'
      });

      expect(transaction.status).to.equal('pending');
      expect(transaction.type).to.equal('transfer');
      expect(transaction.txHash).to.equal('0xtransactionhash123456');
    });

    it('should enforce unique txHash constraint', async () => {
      try {
        await Transaction.create({
          txHash: '0xtransactionhash123456', // duplicate
          from: '0x1111111111111111111111111111111111111111',
          to: '0x2222222222222222222222222222222222222222',
          value: '500000000000000000',
          gasPrice: '20000000000',
          gas: '21000',
          gasUsed: '21000',
          input: '0x',
          blockNumber: 18000001,
          blockHash: '0xblockhash12346',
          status: 'pending'
        });
        expect.fail('Should have thrown unique constraint error');
      } catch (error: any) {
        expect(error.name).to.equal('SequelizeUniqueConstraintError');
      }
    });

    it('should update transaction from pending to confirmed', async () => {
      const transaction = await Transaction.findOne({
        where: { txHash: '0xtransactionhash123456' }
      });

      await transaction.update({
        status: 'confirmed',
        blockNumber: 18000000,
        blockHash: '0xblockhash12345'
      });

      expect(transaction.status).to.equal('confirmed');
    });

    it('should handle failed transactions', async () => {
      const transaction = await Transaction.create({
        txHash: '0xfailedtransactionhash',
        from: '0x3333333333333333333333333333333333333333',
        to: '0x4444444444444444444444444444444444444444',
        value: '100000000000000000',
        gasPrice: '20000000000',
        gas: '21000',
        gasUsed: '21000',
        input: '0x',
        blockNumber: 18000001,
        blockHash: '0xblockhash12346',
        status: 'failed',
        type: 'transfer'
      });

      expect(transaction.status).to.equal('failed');
    });

    it('should track different transaction types', async () => {
      const types = ['transfer', 'deposit', 'withdrawal', 'stake', 'unstake', 'contract', 'other'];

      for (let i = 0; i < types.length; i++) {
        await Transaction.create({
          txHash: `0xtxtype${i}hash`,
          from: '0x5555555555555555555555555555555555555555',
          to: '0x6666666666666666666666666666666666666666',
          value: '1000000000000000000',
          gasPrice: '20000000000',
          gas: '21000',
          gasUsed: '21000',
          input: '0x',
          blockNumber: 18000002,
          blockHash: '0xblockhash12347',
          status: 'confirmed',
          type: types[i] as any
        });
      }

      const txs = await Transaction.findAll({
        where: {
          type: { [sequelize.Op.in]: types }
        }
      });

      expect(txs.length).to.be.greaterThanOrEqual(types.length);
    });

    it('should calculate transaction fee (gasUsed * gasPrice)', async () => {
      const transaction = await Transaction.findOne({
        where: { txHash: '0xtransactionhash123456' }
      });

      const gasUsed = BigInt(transaction.gasUsed);
      const gasPrice = BigInt(transaction.gasPrice);
      const fee = gasUsed * gasPrice;

      expect(fee).to.be.greaterThan(0n);
    });
  });

  after(async () => {
    await sequelize.close();
  });
});
