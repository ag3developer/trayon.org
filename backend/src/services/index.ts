/**
 * Services Index
 * Central export for all service instances
 */

export { BaseService } from './BaseService';
export { UserService } from './UserService';
export { ValidatorService } from './ValidatorService';
export { BridgeService } from './BridgeService';

import UserService from './UserService';
import ValidatorService from './ValidatorService';
import BridgeService from './BridgeService';

export default {
  UserService,
  ValidatorService,
  BridgeService,
};
