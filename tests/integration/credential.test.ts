import { faker } from '@faker-js/faker';
import httpStatus from 'http-status';
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import { createUser } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { createCredential } from '../factories/credentials-factory';
import app, { init } from '@/app';
import { cryptrUtil } from '@/utils/cryptr-utils';

beforeAll(async () => {
    await init();
    await cleanDb();
  });

const server = supertest(app);

describe('GET /credentials', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.get('/credentials');
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
    
        const response = await server.get('/credentials').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    
    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.get('/credentials').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });

    describe('when token is valid', () => {

        it('should respond with status 404 when there is no credentials for given user', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);
    
          const response = await server.get('/credentials').set('Authorization', `Bearer ${token}`);
    
          expect(response.status).toBe(httpStatus.NOT_FOUND);
        });
    
        it('should respond with status 200 and credential for given user', async () => {
          const user = await createUser();
          const token = await generateValidToken(user);

          const credentialA = await createCredential(user);
          const credentialB = await createCredential(user);
    
          const response = await server.get('/credentials').set('Authorization', `Bearer ${token}`);       
          
          expect(response.status).toBe(httpStatus.OK);
          expect(response.body).toEqual([
            {
                  ...credentialA,
                  password: cryptrUtil.decrypt(credentialA.password),
                },
                {
                  ...credentialB,
                  password: cryptrUtil.decrypt(credentialB.password),
                }
            ]);
        });
      });
  });

  describe('GET /credentials/:credentialId', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/credentials');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
  
      it('should respond with status 401 if given token is not valid', async () => {
          const token = faker.lorem.word();
      
          const response = await server.get('/credentials').set('Authorization', `Bearer ${token}`);
      
          expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
      
      it('should respond with status 401 if there is no session for given token', async () => {
          const user = await createUser();
          const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
      
          const response = await server.get('/credentials').set('Authorization', `Bearer ${token}`);
      
          expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
  
      describe('when token is valid', () => {
        it('should respond with status 404 when there is no credentials for given user', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
      
            const response = await server.get('/credentials').set('Authorization', `Bearer ${token}`);
      
            expect(response.status).toBe(httpStatus.NOT_FOUND);
          });
        
        it('should respond with status 404 when the user isnt the credential owner', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const altUser = await createUser();

            const altCredential = await createCredential(altUser);

            const response = await server.get(`/credentials/${altCredential.id}`).set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
            
            expect(response.status).toBe(httpStatus.NOT_FOUND);
          });
        
        it('should respond with status 200 and credential for given user', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
  
            const credential = await createCredential(user);
      
            const response = await server.get('/credentials').set('Authorization', `Bearer ${token}`);       
            
            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual([
              {
                    ...credential,
                    password: cryptrUtil.decrypt(credential.password),
                  }
              ]);
          });
      });
  });

  describe('POST /credentials', () => {

    const createValidBody = () => ({
        title: faker.lorem.sentence(),
        url: faker.internet.url(),
        username: faker.internet.userName(),
        password: faker.internet.password(),
      });

    it('should respond with status 401 if no token is given', async () => {
        const credential = createValidBody();

        const response = await server.post('/credentials').send({ ...credential });
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
  
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
      
        const credential = createValidBody();

        const response = await server
            .post('/credentials').send({ ...credential })
            .send({ ...credential })
            .set('Authorization', `Bearer ${token}`);
      
          expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
      
    it('should respond with status 401 if there is no session for given token', async () => {
        const user = await createUser();

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

        const credential = createValidBody();
    
        const response = await server
          .post('/credentials')
          .send({ ...credential })
          .set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

    describe('when token is valid', () => {
        it('should respond with status 201 and credentialId the data is valid.', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const validCredential = createValidBody();
        
            const response = await server
              .post(`/credentials`)
              .send({ ...validCredential })
              .set('Authorization', `Bearer ${token}`);
        
            expect(response.status).toBe(httpStatus.CREATED);
            expect(response.body).toEqual({
              credentialId: expect.any(Number),
            });
        });
    });
});

describe('DELETE /credentials/:credentialId', () => {
    it('should respond with status 401 if no token is given', async () => {
        const credential = await createCredential();
        const response = await server.delete(`/credentials/${credential.id}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
  
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
        const credential = await createCredential();
    
        const response = await server.delete(`/credentials/${credential.id}`).set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
      
    it('should respond with status 401 if there is no session for given token', async () => {
        const user = await createUser();
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

        const credential = await createCredential();
    
        const response = await server.delete(`/credentials/${credential.id}`).set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
    
    it('should respond with status 404 if the doesnt exist', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
    
        const response = await server.delete(`/credentials/1`).set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });
    

    it('should respond with status 404 if the credential exists, but belongs to another user', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const credential = await createCredential();
    
        const response = await server.delete(`/credentials/${credential.id}`).set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

    describe('when token is valid', () => {
        it('should respond with status 202 when the user send the right data.', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const credential = await createCredential(user);
        
            const response = await server.delete(`/credentials/${credential.id}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.ACCEPTED)
        })
    });
});