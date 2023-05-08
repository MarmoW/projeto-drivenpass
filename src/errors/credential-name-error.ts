import { ApplicationError } from '@/protocols';

export function CredentialNameError(): ApplicationError {
  return {
    name: 'CredentialNameError',
    message: 'A Credential with this name already exists',
  };
}