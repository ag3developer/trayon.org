import { expect } from 'chai';
import { Validator } from '../Validator';
import { sequelize } from '../../sequelize';

describe('Validator Model', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  it('should create validator with staking data', async () => {
    const validator = await Validator.create({
      address: '0xvalidatoraddress1234567890123456789012',
      publicKey: 'validator_public_key_base64',
      status: 'active',
      stakedAmount: '1000000000000000000', // 1 token in wei
      commission: 10,
      uptime: 99.5
    });

    expect(validator.status).to.equal('active');
    expect(validator.stakedAmount).to.equal('1000000000000000000');
    expect(validator.commission).to.equal(10);
  });

  it('should retrieve active validators', async () => {
    const activeValidators = await Validator.findAll({
      where: { status: 'active' }
    });

    expect(activeValidators.length).to.be.greaterThan(0);
    activeValidators.forEach(v => {
      expect(v.status).to.equal('active');
    });
  });

  it('should slash validator and update status', async () => {
    const validator = await Validator.findOne({
      where: { address: '0xvalidatoraddress1234567890123456789012' }
    });

    const originalStake = validator.stakedAmount;
    const slashAmount = Math.floor(parseInt(originalStake) * 0.1); // 10% slash

    await validator.update({
      status: 'slashed',
      stakedAmount: (parseInt(originalStake) - slashAmount).toString()
    });

    expect(validator.status).to.equal('slashed');
    expect(parseInt(validator.stakedAmount)).to.be.lessThan(parseInt(originalStake));
  });

  it('should unjail validator after cooldown', async () => {
    const validator = await Validator.findOne({
      where: { address: '0xvalidatoraddress1234567890123456789012' }
    });

    await validator.update({
      status: 'active',
      jailedUntil: null
    });

    expect(validator.status).to.equal('active');
    expect(validator.jailedUntil).to.be.null;
  });

  it('should track validator metrics', async () => {
    const validator = await Validator.findOne({
      where: { address: '0xvalidatoraddress1234567890123456789012' }
    });

    await validator.update({
      successfulProposals: 1500,
      failedProposals: 5,
      lastHeartbeat: new Date()
    });

    expect(validator.successfulProposals).to.equal(1500);
    expect(validator.failedProposals).to.equal(5);
  });

  it('should enforce unique address constraint', async () => {
    try {
      await Validator.create({
        address: '0xvalidatoraddress1234567890123456789012', // duplicate
        publicKey: 'another_public_key',
        status: 'active',
        stakedAmount: '500000000000000000',
        commission: 5
      });
      expect.fail('Should have thrown unique constraint error');
    } catch (error: any) {
      expect(error.name).to.equal('SequelizeUniqueConstraintError');
    }
  });

  it('should create multiple validators', async () => {
    const validator2 = await Validator.create({
      address: '0xvalidator2address1234567890123456789012',
      publicKey: 'validator2_public_key',
      status: 'active',
      stakedAmount: '2000000000000000000',
      commission: 15,
      uptime: 98.0
    });

    const validator3 = await Validator.create({
      address: '0xvalidator3address1234567890123456789012',
      publicKey: 'validator3_public_key',
      status: 'inactive',
      stakedAmount: '500000000000000000',
      commission: 5,
      uptime: 45.0
    });

    const allValidators = await Validator.findAll();
    expect(allValidators.length).to.be.greaterThanOrEqual(3);
  });

  after(async () => {
    await sequelize.close();
  });
});
