/**
 * Stats Routes
 */

import { Router, Request, Response } from 'express';
import Logger from '../../utils/logger';

const router = Router();
const logger = new Logger('StatsRoutes');

/**
 * GET /api/v1/stats
 * Get overall statistics
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    network: {
      blockHeight: 0,
      transactions: 0,
      validators: 0,
    },
    token: {
      totalSupply: '1000000000',
      circulatingSupply: '0',
      holders: 0,
    },
    bridge: {
      depositedVolume: '0',
      withdrawnVolume: '0',
      activeDeposits: 0,
    },
  });
});

export default router;
