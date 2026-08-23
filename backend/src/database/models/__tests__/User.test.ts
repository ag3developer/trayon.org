import { expect } from 'chai';
import { User } from '../User';
import { sequelize } from '../../sequelize';

describe('User Model', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  it('should create a user with valid address', async () => {
    const user = await User.create({
      address: '0x1234567890123456789012345678901234567890',
      email: 'test@trayon.org',
      username: 'testuser',
      passwordHash: 'hashed_password_123',
      role: 'user'
    });

    expect(user).to.exist;
    expect(user.address).to.equal('0x1234567890123456789012345678901234567890');
    expect(user.role).to.equal('user');
    expect(user.status).to.equal('active');
  });

  it('should find user by address', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const user = await User.findOne({ where: { address } });
    
    expect(user).to.exist;
    expect(user.address).to.equal(address);
    expect(user.email).to.equal('test@trayon.org');
  });

  it('should find user by email', async () => {
    const user = await User.findOne({ where: { email: 'test@trayon.org' } });
    
    expect(user).to.exist;
    expect(user.username).to.equal('testuser');
  });

  it('should update user status', async () => {
    const user = await User.findOne({ 
      where: { address: '0x1234567890123456789012345678901234567890' } 
    });
    
    await user.update({ status: 'inactive' });
    
    expect(user.status).to.equal('inactive');
  });

  it('should validate unique email constraint', async () => {
    try {
      await User.create({
        address: '0x9876543210987654321098765432109876543210',
        email: 'test@trayon.org', // duplicate
        username: 'anotheruser',
        passwordHash: 'hashed_password_456',
        role: 'user'
      });
      expect.fail('Should have thrown unique constraint error');
    } catch (error: any) {
      expect(error.name).to.equal('SequelizeUniqueConstraintError');
    }
  });

  it('should validate unique username constraint', async () => {
    try {
      await User.create({
        address: '0x1111111111111111111111111111111111111111',
        email: 'newemail@trayon.org',
        username: 'testuser', // duplicate
        passwordHash: 'hashed_password_789',
        role: 'user'
      });
      expect.fail('Should have thrown unique constraint error');
    } catch (error: any) {
      expect(error.name).to.equal('SequelizeUniqueConstraintError');
    }
  });

  it('should return user with correct indexes', async () => {
    const users = await User.findAll({
      where: { role: 'user' }
    });
    
    expect(users.length).to.be.greaterThan(0);
    expect(users[0].address).to.match(/^0x[a-fA-F0-9]{40}$/);
  });

  after(async () => {
    await sequelize.close();
  });
});
