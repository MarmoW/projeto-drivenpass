import { Prisma } from '@prisma/client';
import { prisma } from '@/config';


async function createNetwork(data: Prisma.NetworkUncheckedCreateInput) {
    return prisma.network.create({
      data,
    });
  }

  
async function findById(id: number, select?: Prisma.UserSelect) {
  const params: Prisma.NetworkFindUniqueArgs = {
    where: {
      id,
    },
  };

  if (select) {
    params.select = select;
  }

  return prisma.network.findUnique(params);
}

async function findByTitle(userId: number, title: string) {
  return prisma.network.findFirst({
    where: {
      userId,
      title,
    },
  });
}

async function listNetwork(userId: number) {
  return prisma.network.findMany({
    where: {
      userId,
    },
  });
}


async function deleteNetwork(credentialId: number) {
  return prisma.network.delete({
    where: {
      id: credentialId,
    },
  });
}

const networkRepository = {
  createNetwork,
  findById,
  findByTitle,
  listNetwork,
  deleteNetwork,
};

export default networkRepository;