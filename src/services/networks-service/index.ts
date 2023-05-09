import { Network } from '@prisma/client';
import networkRepository from '@/repositories/network-repository';
import { cryptrUtil } from '@/utils/cryptr-utils';
import { CredentialNameError, notFoundError } from '@/errors';

async function newNetwork({ userId, title, network, password }: CreateNetworkParams): Promise<Network> {
    await CheckIfTitleIsUnique(userId, title);
  
    const hashedPassword = cryptrUtil.encrypt(password);
    return networkRepository.createNetwork({
      userId,
      title,
      network,
      password: hashedPassword,
    });
  }

async function CheckIfTitleIsUnique(userId: number, title: string) {
    const repeatedNetworkName = await networkRepository.findByTitle(userId, title);
    if (repeatedNetworkName) {
      throw CredentialNameError();
    }
  }
  

async function locateNetwork(userId: number, networkId: number) {
    const findnetwork = await networkRepository.findById(networkId);
   
    if (!findnetwork || findnetwork.userId != userId) {
      throw notFoundError();
    }
  
    findnetwork.password = cryptrUtil.decrypt(findnetwork.password);
    return findnetwork;
  }


async function listNetwork(userId: number) {
  const networkslist = await networkRepository.listNetwork(userId);

  if (networkslist.length === 0) {
    throw notFoundError();
  }

  networkslist.map((network) => (network.password = cryptrUtil.decrypt(network.password)));
  return networkslist;
}


async function networkDelete(userId: number, networkId: number) {
  const findnetwork = await networkRepository.findById(networkId);
  if (!findnetwork || findnetwork.userId !== userId) {
    throw notFoundError();
  }

  await networkRepository.deleteNetwork(networkId);
}


export type CreateNetworkParams = Pick<Network, 'userId' | 'title' | 'network' | 'password'>;

const networkService = {
  newNetwork,
  locateNetwork,
  listNetwork,    
  networkDelete,
};

export default networkService;