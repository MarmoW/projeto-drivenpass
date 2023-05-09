import Cryptr from 'cryptr';

const cryptr = new Cryptr(process.env.CRYPTR_SECRET);

function encrypt(password: string) {
  return cryptr.encrypt(password);
}

function decrypt(encryptedPassword: string) {
  return cryptr.decrypt(encryptedPassword);
}

export const cryptrUtil = {
  encrypt,
  decrypt,
};