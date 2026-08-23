/**
 * Staking Routes
 */

import { Router, Request, Response } from 'express';
import Logger from '../../utils/logger';

const router = Router();
const logger = new Logger('StakingRoutes');

/**
 * GET /api/v1/staking/info
 * Get staking information
 */
router.get('/info', (req: Request, res: Response) => {
  res.json({
    minimumStake: '32000',
    withdrawalDelay: 604800, // 7 days in seconds
    apy: '0.00',
    totalStaked: '0',
    activeValidators: 0,
  });
});

/**
 * POST /api/v1/staking/stake
 * Stake TRAY
 */
router.post('/stake', (req: Request, res: Response) => {
  try {
    const { address, amount } = req.body;

    if (!address || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: address, amount',
      });
    }

    logger.info(`Stake request from ${address} for ${amount} TRAY`);

    res.json({
      txHash: '0x...',
      status: 'pending',
    });
  } catch (error) {
    res.status(500).json({ error: 'Staking failed' });
  }
});

/**
 * POST /api/v1/staking/unstake
 * Unstake TRAY
 */
router.post('/unstake', (req: Request, res: Response) => {
  try {
    const { address, amount } = req.body;

    if (!address || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: address, amount',
      });
    }

    logger.info(`Unstake request from ${address} for ${amount} TRAY`);

    res.json({
      txHash: '0x...',
      status: 'pending',
    });
  } catch (error) {
    res.status(500).json({ error: 'Unstaking failed' });
  }
});

export default router;
