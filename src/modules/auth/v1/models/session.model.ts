export class SessionModel {
  sessionId: string;
  authId: string;
  lastLoginFrom: string;
  lastLoginDate: number;
  lastToken: string;
  sessionType: string;
  context: object;
  expiresAt: number;
  description: string;

  constructor(body: SessionModel) {
    this.sessionId = body.sessionId;
    this.authId = body.authId;
    this.lastLoginFrom = body.lastLoginFrom;
    this.lastLoginDate = body.lastLoginDate;
    this.lastToken = body.lastToken;
    this.sessionType = body.sessionType;
    this.context = body.context;
    this.expiresAt = body.expiresAt;
    this.description = body.description;
  }
}