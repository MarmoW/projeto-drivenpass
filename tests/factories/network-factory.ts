import faker from '@faker-js/faker';
import { Network, User } from '@prisma/client';
import { createUser } from './users-factory';
import { prisma } from '@/config';
import { cryptrUtil } from '@/utils/cryptr-utils';

export async function createNetwork(user?: User): Promise<Network> {
  
  const incomingUser = user || (await createUser());

  const password = cryptrUtil.encrypt(faker.internet.password(10));

  return prisma.network.create({
    data: {
      title: faker.lorem.sentence(),
      network: faker.lorem.sentence(),
      password: password,
      userId: incomingUser.id,
    },
  });
}