import { Router } from 'express';
import { newCredentialSchema } from '@/schemas';
import { authenticateToken, validateBody } from '@/middlewares';
import { credentialsList, credentialsLocate, credentialsStore, credentialsDelete } from '@/controllers';

const credentialRouter = Router();

credentialRouter
    .all('/*', authenticateToken)
    .get('/', credentialsList)
    .get('/:credentialId', credentialsLocate)
    .post('/', validateBody(newCredentialSchema), credentialsStore)
    .delete('/:credentialId', credentialsDelete);

export { credentialRouter };
