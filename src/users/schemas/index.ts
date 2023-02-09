export interface IAccountData {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}
export interface IPasswordRecovery {
  recoveryCode: string | null;
  expirationDate: string | null;
}
export interface IEmailConfirmation {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
}
