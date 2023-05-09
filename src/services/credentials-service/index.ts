import { Credential } from '@prisma/client';
import credentialRepository from '@/repositories/credential-repository';
import { cryptrUtil } from '@/utils/cryptr-utils';
import {  CredentialNameError , notFoundError } from '@/errors';


async function locateCredential(userId: number, credentialId: number) {
  const credential = await credentialRepository.findById(credentialId);
  if (!credential || credential.userId !== userId) {
    throw notFoundError();
  }

  credential.password = cryptrUtil.decrypt(credential.password);
  return credential;
}

async function listCredential(userId: number) {
    const credentials = await credentialRepository.listCredential(userId);
    if (credentials.length === 0) {
      throw notFoundError();
    }
  
    credentials.map((credential) => (credential.password = cryptrUtil.decrypt(credential.password)));
    return credentials;
  }

export async function createCredential({
  userId,
  title,
  url,
  username,
  password,
}: CreateCredentialParams): Promise<Credential> {
  await CheckIfTitleIsUnique(userId, title);

  const hashedPassword = cryptrUtil.encrypt(password);
  return credentialRepository.createCredential({
    userId,
    title,
    url,
    username,
    password: hashedPassword,
  });
}
async function CheckIfTitleIsUnique(userId: number, title: string) {
    const repeatedTitleName = await credentialRepository.findByTitle(userId, title);
    if (repeatedTitleName) {
      throw CredentialNameError();
    }
  }

async function credentialDelete(userId: number, credentialId: number) {
  const credential = await credentialRepository.findById(credentialId);
  if (credential.userId !== userId ||  !credential ) {
    throw notFoundError();
  }

  await credentialRepository.deleteCredential(credentialId);
}



export type CreateCredentialParams = Pick<Credential, 'userId' | 'title' | 'url' | 'username' | 'password'>;

const credentialService = {
  locateCredential,
  listCredential,  
  createCredential,
  credentialDelete,
};

export default credentialService;