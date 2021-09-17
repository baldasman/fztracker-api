import { Injectable, Logger } from '@nestjs/common';
import { AdUser } from '../../../core/models/ad-user.model';

const ActiveDirectory = require('activedirectory2');
const fs = require("fs");
@Injectable()
export class AdService {

  private adminUsername;
  private adminPassword;
  private config;
  private ad;

  constructor(
    private readonly logger: Logger
  ) {
    this.logger.setContext(AdService.name);

    // TODO: create env variables
    this.adminUsername = 'm0x74951@marinha.pt';
    this.adminPassword = 'inform@20';

    this.config = {

      //implemenado protoco LDAPS a 26/07/2021 pelas 03:35
      url: 'ldaps://AD-N-19-2.marinha.pt:636',
      //url: 'ldaps://10.45.0.5:636',
      baseDN: 'OU=Marinha,DC=marinha,DC=pt',
      username: this.adminUsername,
      password: this.adminPassword,
      tlsOptions: {
        ca: [fs.readFileSync('d:\ad.cer')],
        rejectUnauthorized: false 
    }
    }

    this.ad = new ActiveDirectory(this.config);
  }

  async authenticate(username: string, password: string): Promise<boolean> {
    const thatAd = this.ad;

    return new Promise(function (resolve, reject) {
      thatAd.authenticate(username, password, function (err, auth) {
        if (err) {
          console.error('ERROR: ' + JSON.stringify(err));
          reject(err);
          return;
        }

        if (auth) {
          resolve(true);
        }
        else {
          console.error('AD Authentication failed!');
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
          console.error('ERROR: ' + JSON.stringify(err));
          reject(err);
          return;
        }

        if (!user) {
          console.log('AD User: ' + username + ' not found.');

          reject({ message: 'User: ' + username + ' not found.' });
        } else {
          console.log('detalhes' + JSON.stringify(user));

        //  thatAd.getGroupMembershipForUser(username, function (err, groups) {
       //     console.log(JSON.stringify(groups));
         // });

          const adUser = new AdUser(user);
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

  async isMemberOf(username: string, groupName: string): Promise<boolean> {
    const thatAd = this.ad;
    return new Promise(function (resolve, reject) {

      thatAd.isUserMemberOf(username, groupName, function (err, isMember) {
        resolve(isMember);
      });
    })
  };

}

