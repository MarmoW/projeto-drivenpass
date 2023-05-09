import { faker } from '@faker-js/faker';
import httpStatus from 'http-status';
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import { createUser } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { createNetwork } from '../factories/network-factory';
import app, { init } from '@/app';
import { cryptrUtil } from '@/utils/cryptr-utils';

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe('GET /networks', () => {

    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/networks');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    
      it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
    
        const response = await server.get('/networks').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    
      it('should respond with status 401 if there is no session for given token', async () => {
        const user = await createUser();
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    
        const response = await server.get('/networks').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
      describe('when token is valid', () => {
        it('should respond with status 404 when user has no networks', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
    
          const response = await server.get('/networks').set('Authorization', `Bearer ${token}`);
          expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });
    
        it('should respond with status 200 and the networks', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
    
          const networkA = await createNetwork(user);
          const networkB = await createNetwork(user);
    
          const response = await server.get('/networks').set('Authorization', `Bearer ${token}`);
    
          expect(response.status).toEqual(httpStatus.OK);
    
          expect(response.body).toEqual([
            {
              ...networkA,
              password: cryptrUtil.decrypt(networkA.password),
            },
            {
              ...networkB,
              password: cryptrUtil.decrypt(networkB.password),
            },
          ]);
        });
      });

});

describe('GET /networks/:networksId', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/networks');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
  
      it('should respond with status 401 if given token is not valid', async () => {
          const token = faker.lorem.word();
      
          const response = await server.get('/networks').set('Authorization', `Bearer ${token}`);
      
          expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
      
      it('should respond with status 401 if there is no session for given token', async () => {
          const user = await createUser();
          const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
      
          const response = await server.get('/networks').set('Authorization', `Bearer ${token}`);
      
          expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
  
      describe('when token is valid', () => {
        it('should respond with status 404 when there is no networks for given user', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
      
            const response = await server.get('/networks').set('Authorization', `Bearer ${token}`);
      
            expect(response.status).toBe(httpStatus.NOT_FOUND);
          });
        

        it('should respond with status 404 when the user isnt the credential owner', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const altUser = await createUser();

            const network = await createNetwork(altUser);

            const response = await server.get(`/networks/${network.id}`).set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
          });

        
        it('should respond with status 200 and network for given user', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
  
            const network = await createNetwork(user);
      
            const response = await server.get('/networks').set('Authorization', `Bearer ${token}`);       
            
            expect(response.status).toEqual(httpStatus.OK);

            expect(response.body).toEqual([
              {
                    ...network,
                    password: cryptrUtil.decrypt(network.password),
                  }
              ]);
          });
      });
  });

describe('POST /networks', () => {

    const createValidBody = () => ({
        title: faker.lorem.sentence(),
        network: faker.lorem.sentence(),
        password: faker.internet.password(),
      });

    it('should respond with status 401 if no token is given', async () => {
        const network = createValidBody();

        const response = await server.post('/networks').send({ ...network });
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
  
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
      
        const network = createValidBody();

        const response = await server
            .post('/networks').send({ ...network })
            .send({ ...network })
            .set('Authorization', `Bearer ${token}`);
      
          expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
      
    it('should respond with status 401 if there is no session for given token', async () => {
        const user = await createUser();

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

        const networks = createValidBody();
    
        const response = await server
          .post('/networks')
          .send({ ...networks })
          .set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

    it('should respond with status 409 if exists other network with the same title.', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const network = createValidBody();
        const network2 = await createNetwork(user);
        
        network.title = network2.title;
        
        const response = await server
            .post(`/networks`)
            .send({ ...network })
            .set('Authorization', `Bearer ${token}`);
        
            expect(response.status).toBe(httpStatus.CONFLICT);
        });
    
    
    it('should respond with status 201 and networkId the data is valid.', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const network = createValidBody();
        
        const response = await server
            .post(`/networks`)
            .send({ ...network })
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(httpStatus.CREATED);
        expect(response.body).toEqual({
            credentialId: expect.any(Number),
            });
        });
    
});

describe('DELETE /credentials/:credentialId', () => {
    it('should respond with status 401 if no token is given', async () => {
        const network = await createNetwork();
        const response = await server.delete(`/credentials/${network.id}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
  
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
        const network = await createNetwork();
    
        const response = await server.delete(`/credentials/${network.id}`).set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
      
    it('should respond with status 401 if there is no session for given token', async () => {
        const user = await createUser();
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

        const network = await createNetwork();
    
        const response = await server.delete(`/credentials/${network.id}`).set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    
    it('should respond with status 404 if the network doesnt exists', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
    
        const response = await server.delete(`/networks/1`).set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

    it('should respond with status 404 if the network exists but user isnt the owner', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const network = await createNetwork();
    
        const response = await server.delete(`/network/${network.id}`).set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

    
    it('should respond with status 202 when the user send the right data.', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const network = await createNetwork(user);
        
            const response = await server.delete(`/networks/${network.id}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.ACCEPTED)
    })
    
});