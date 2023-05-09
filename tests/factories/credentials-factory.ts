import faker from '@faker-js/faker';
import { Credential, User } from '@prisma/client';
import { createUser } from './users-factory';
import { prisma } from '@/config';
import { cryptrUtil } from '@/utils/cryptr-utils';

export async function createCredential(user?: User): Promise<Credential> {
  
  const incomingUser = user || (await createUser());

  const password = cryptrUtil.encrypt(faker.internet.password(10));

  return prisma.credential.create({
    data: {
      title: faker.lorem.sentence(),
      url: faker.internet.url(),
      username: faker.internet.userName(),
      password: password,
      userId: incomingUser.id,
    },
  });
}