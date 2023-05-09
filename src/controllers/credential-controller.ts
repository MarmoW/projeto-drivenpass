import httpStatus from 'http-status';
import { NextFunction, Response } from 'express';
import credentialService, { CreateCredentialParams } from '@/services/credentials-service';
import { AuthenticatedRequest } from '@/middlewares';
import { nextTick } from 'process';

export async function credentialsList(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;

  try {
    const credentials = await credentialService.listCredential(userId);
    return res.status(httpStatus.OK).send(credentials);
  } catch (err) {
    next(err);
  }
}

export async function credentialsLocate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { credentialId } = req.params;
  const { userId } = req;

  try {
    const findcredentials = await credentialService.locateCredential(userId, parseInt(credentialId));
    return res.status(httpStatus.OK).send(findcredentials);

  } catch (err) {
    next(err);
  }
}

export async function credentialsStore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { title, url, username, password } = req.body as CreateCredentialParams;
  const { userId } = req;

  try {
    const newcredential = await credentialService.createCredential({ userId, title, url, username, password });
    return res.status(httpStatus.CREATED).json({
      credentialId: newcredential.id,
    });
  } catch (err) {
    next(err);
    }
    
  }


export async function credentialsDelete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { credentialId } = req.params;

  try {
    await credentialService.credentialDelete(userId, parseInt(credentialId));
    return res.sendStatus(httpStatus.ACCEPTED);
  } catch (err) {
    next(err);
  }
}