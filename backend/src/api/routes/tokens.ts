/**
 * Tokens Routes
 */

import { Router, Request, Response } from 'express';
import Logger from '../../utils/logger';

const router = Router();
const logger = new Logger('TokensRoutes');

/**
 * GET /api/v1/tokens
 * Get token information
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    token: 'TRAY',
    totalSupply: '1000000000',
    circulatingSupply: '0',
    price: '0.00',
    marketCap: '0',
  });
});

/**
 * GET /api/v1/tokens/allocations
 * Get token allocations
 */
router.get('/allocations', (req: Request, res: Response) => {
  res.json({
    allocations: [
      { category: 'Initial Launch', percentage: 20 },
      { category: 'DAO Treasury', percentage: 30 },
      { category: 'Validators', percentage: 20 },
      { category: 'Dev Team', percentage: 15 },
      { category: 'Partnerships', percentage: 10 },
      { category: 'Strategic Reserve', percentage: 5 },
    ],
  });
});

export default router;
