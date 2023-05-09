import httpStatus from 'http-status';
import { NextFunction, Response } from 'express';
import networkService, { CreateNetworkParams } from '@/services/networks-service';
import { AuthenticatedRequest } from '@/middlewares';
import { nextTick } from 'process';

export async function networksList(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;

  try {
    const credentials = await networkService.listNetwork(userId);
    return res.status(httpStatus.OK).send(credentials);
  } catch (err) {
    next(err);
  }
}

export async function networksLocate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { networkId } = req.params;
  const { userId } = req;

  try {
    const findcredentials = await networkService.locateNetwork(userId, parseInt(networkId));
    return res.status(httpStatus.OK).send(findcredentials);
  } catch (err) {
    next(err);
  }
}

export async function networksStore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { title, network, password } = req.body as CreateNetworkParams;
  const { userId } = req;

  try {
    const newcredential = await networkService.newNetwork({ userId, title, network, password });
    return res.status(httpStatus.CREATED).json({
      credentialId: newcredential.id,
    });
  } catch (err) {
    next(err);
  }
}

export async function networksDelete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { networkId } = req.params;

  try {
    await networkService.networkDelete(userId, parseInt(networkId));
    return res.sendStatus(httpStatus.ACCEPTED);
  } catch (err) {
    next(err);
  }
}