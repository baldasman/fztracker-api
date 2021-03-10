import { AuthModel } from "./auth.model";

export class AdUser {
  dn: string;
  distinguishedName: string;
  userPrincipalName: string;
  sAMAccountName: string;
  mail: string;
  lockoutTime: string;
  whenCreated: string;
  pwdLastSet: string;
  userAccountControl: string;
  employeeID: string;
  sn: string;
  givenName: string;
  cn: string;
  displayName: string;
  description: string;

  constructor(data: Partial<AdUser>) {
    this.dn = data?.dn;
    this.distinguishedName = data?.distinguishedName;
    this.userPrincipalName = data?.userPrincipalName;
    this.sAMAccountName = data?.sAMAccountName;
    this.mail = data?.mail;
    this.lockoutTime = data?.lockoutTime;
    this.whenCreated = data?.whenCreated;
    this.pwdLastSet = data?.pwdLastSet;
    this.userAccountControl = data?.userAccountControl;
    this.employeeID = data?.employeeID;
    this.sn = data?.sn;
    this.givenName = data?.givenName;
    this.cn = data?.cn;
    this.displayName = data?.displayName;
    this.description = data?.description;
  }

  toLocalUser(u: Partial<AdUser>): AuthModel {
    const user = new AuthModel({
      authId: u.mail,
      name: u.displayName,
      isActive: true,
      isAdmin: false,
      isApi: false,
      numberOfLogins: 0
    });

    return user;
  }
}