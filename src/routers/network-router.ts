import { Router } from 'express';
import { newNetworkSchema } from '@/schemas';
import { validateBody } from '@/middlewares';
import { networksList, networksLocate, networksStore, networksDelete } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const networkRouter = Router();

networkRouter
    .all('/*', authenticateToken)
    .get('/:networkId', networksLocate)
    .get('/', networksList)
    .post('/', validateBody(newNetworkSchema), networksStore)
    .delete('/:networkId', networksDelete)

export { networkRouter };
