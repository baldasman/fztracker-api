import { Injectable, Inject, Logger } from '@nestjs/common';
import { info } from 'console';

const ActiveDirectory = require('activedirectory2');

@Injectable()
export class AdService {

  private adminUsername;
  private adminPassword;
  private config;
  private ad;

  constructor(
    private readonly logger: Logger
  ) {
    // TODO: create env variables
    this.adminUsername = 'm0x74951@marinha.pt';
    this.adminPassword = 'inform@20';

    this.config = {
      url: 'ldap://AD-N-19-1.marinha.pt',
      //searchDN: 'CN=harbour,OU=DevSecurityGroups,DC=domatica,DC=local',
      baseDN: 'DC=marinha,DC=pt',
      username: this.adminUsername,
      password: this.adminPassword
    }

    this.ad = new ActiveDirectory(this.config);
  }

  async authenticate(username: string, password: string) {
    this.logger.setContext(AdService.name);
    let isAithenticated = false;

    await this.ad.authenticate(username, password, function (err, auth) {
      if (err) {
        console.log('ERROR: ' + JSON.stringify(err));
        return;
      }

      if (auth) {
        console.log('Authenticated!');
        isAithenticated = true;
      }
      else {
        console.log('Authentication failed!');
      }
    });

    // const groupName = 'DevAdminGroup';
    // ad.isUserMemberOf(username, groupName, function (err, isMember) {
    //   if (err) {
    //     console.log('ERROR: ' + JSON.stringify(err));
    //     return;
    //   }

    //   console.log(username + ' isMemberOf ' + groupName + ': ' + isMember);
    // });

    // // Any of the following username types can be searched on
    // const sAMAccountName = 'm22286';
    // // const userPrincipalName = 'm9830401@marinha.pt';
    // // const dn = 'CN=Smith\\, John,OU=Users,DC=domain,DC=com';
    // const dn = 'DC=marinha,DC=pt';



    return isAithenticated;
  }

  async findUser(username: string) {
    let info = {
      username
    };

    // Find user by a sAMAccountName
    await this.ad.findUser(username, function (err, user) {
      if (err) {
        console.log('ERROR: ' + JSON.stringify(err));
        return;
      }

      if (!user) { 
        console.log('User: ' + username + ' not found.'); 
      } else { 
        console.log('detalhes ' + JSON.stringify(user)); 
        info = user;
      }
    });

    return info;
  }
}
