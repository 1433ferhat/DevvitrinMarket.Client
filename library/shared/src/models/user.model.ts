import { UserOperationClaimModel } from './user-operation-claim.model';

export interface UserModel {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  userOperationClaims: UserOperationClaimModel[];
  status: string;
}