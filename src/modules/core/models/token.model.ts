export class TokenModel {
  authId: string;
  externalId: string;
  name: string;
  sessionId: string;
  sessionType: string;
  numberOfLogins: number;
  lastLoginDate: number;
  ttl: number;
  createdAt: number;

  constructor(body: TokenModel) {
    this.authId = body.authId;
    this.externalId = body.externalId;
    this.name = body.name;
    this.sessionId = body.sessionId;
    this.sessionType = body.sessionType;
    this.numberOfLogins = body.numberOfLogins;
    this.lastLoginDate = body.lastLoginDate;
    this.ttl = body.ttl;
    this.createdAt = body.createdAt;
  }
}