import { Prisma } from '@prisma/client';
import { prisma } from '@/config';

async function createCredential(data: Prisma.CredentialUncheckedCreateInput) {
  return prisma.credential.create({
    data,
  });
}

async function listCredential(userId: number) {
    return prisma.credential.findMany({
      where: {
        userId,
      },
    });
  }  

async function deleteCredential(credentialId: number) {
  return prisma.credential.delete({
    where: {
      id: credentialId,
    },
  });
}

async function findById(id: number, select?: Prisma.UserSelect) {
    const params: Prisma.CredentialFindUniqueArgs = {
      where: {
        id,
      },
    };
  
    if (select) {
      params.select = select;
    }
  
    return prisma.credential.findUnique(params);
  }
  
  async function findByTitle(userId: number, title: string) {
    return prisma.credential.findFirst({
      where: {
        userId,
        title,
      },
    });
  }
  

const credentialRepository = {
  createCredential,
  listCredential,
  deleteCredential,
  findById,
  findByTitle,
};

export default credentialRepository;