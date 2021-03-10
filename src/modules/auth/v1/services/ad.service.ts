import { Injectable, Logger } from '@nestjs/common';
import { AdUser } from '../../../core/models/ad-user.model';

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
      url: 'ldap://AD-N-19-2.marinha.pt',
      //searchDN: 'CN=harbour,OU=DevSecurityGroups,DC=domatica,DC=local',
      baseDN: 'OU=Marinha,DC=marinha,DC=pt',
      username: this.adminUsername,
      password: this.adminPassword
    }


    this.ad = new ActiveDirectory(this.config);
  }

  async authenticate(username: string, password: string) {
    this.logger.setContext(AdService.name);

    const thatAd = this.ad;
    return new Promise(function (resolve, reject) {
      // window.onload = resolve;
      thatAd.authenticate(username, password, function (err, auth) {

        //console.log('informaçao' + username, password, err,auth );
        if (err) {
          console.log('ERROR: ' + JSON.stringify(err));
          reject(err);
          return;
        }


        if (auth) {
          console.log('Authenticated!');
          resolve({ valid: true });
        }
        else {
          console.log('Authentication failed!');
          reject({ message: 'Authentication failed!' });
        }
      });

    });
  }

  async findUser(username: string): Promise<AdUser> {
    const thatAd = this.ad;

    return new Promise(function (resolve, reject) {
      // window.onload = resolve;
      thatAd.findUser(username, function (err, user) {
        if (err) {
          console.log('ERROR: ' + JSON.stringify(err));
          reject(err);
          return;
        }

        if (!user) {
          console.log('User: ' + username + ' not found.');

          reject({ message: 'User: ' + username + ' not found.' });
        } else {
          console.log('detalhes' + JSON.stringify(user));

          thatAd.getGroupMembershipForUser(username, function (err, groups) {
            console.log(JSON.stringify(groups));
          });

          const adUser = new AdUser(user.user);
          resolve(adUser);
        }
      });

      // var query = 'OU=CCF';

      // thatAd.findUsers(query, true, function(err, users) {
      //   console.log('detalhes' + JSON.stringify(users));
      //   resolve(users);
      // });
    });
  }

  async isMemberOf(username: string, groupName: string) {
    const thatAd = this.ad;
    return new Promise(function (resolve, reject) {

      thatAd.isUserMemberOf(username, groupName, function (err, isMember) {

        // console.log(username + ' isMemberOf ' + groupName + ': ' + isMember);

        resolve(isMember);
      });
    })
  };

}

