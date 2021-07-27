export class AuthModel {
  authId: string;
  password: string;
  name: string;
  numberOfLogins: number;
  confirmationCode: string;
  createdAt: number;
  confirmationCodeCreatedAt: number;
  deactivatedAt: number;
  deletedAt: number;
  isActive: boolean;
  isAdmin: boolean;
  acessRank: boolean;
  isApi: boolean;
  activationToken: string;

  constructor(data: Partial<AuthModel>) {
    this.authId = data.authId;
    this.password = data.password;
    this.name = data.name;
    this.numberOfLogins = data.numberOfLogins;
    this.confirmationCode = data.confirmationCode;
    this.createdAt = data.createdAt;
    this.confirmationCodeCreatedAt = data.confirmationCodeCreatedAt;
    this.deactivatedAt = data.deactivatedAt;
    this.deletedAt = data.deletedAt;
    this.isActive = data.isActive;
    this.acessRank = data.acessRank;
    this.isAdmin = data.isAdmin;
    this.activationToken = data.activationToken;
  }
}