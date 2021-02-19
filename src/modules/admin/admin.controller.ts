import { Body, Controller, Get, Logger, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MongooseHealthIndicator } from '@nestjs/terminus';
import { Response } from 'express';

import { getResponse } from '../core/helpers/response.helper';
import { MailSenderService } from '../core/services/mailsender.service';


import * as fs from 'fs';
import * as PdfPrinter from 'pdfmake';
import * as uuid from 'uuid/v4';
import { UserService } from '../fztracker/services/user.service';

const ActiveDirectory = require('activedirectory2');

@Controller('admin')
@ApiTags('Admin')
export class AdminController {
  constructor(
    private readonly logger: Logger,
    private readonly mailSender: MailSenderService,
    private readonly userService: UserService,
    private readonly mongooseHealthIndicator: MongooseHealthIndicator) {
    this.logger.log('Init admin controller', AdminController.name);
  }

  @Get('status')
  @ApiOperation({ description: 'Return information about the API\'s status' })
  @ApiResponse({ status: 200, description: 'Status information returned sucessfully!' })
  @ApiResponse({ status: 500, description: 'API DB is dead' })
  async status(@Res() res: Response) {
    const mongoState = await this.mongooseHealthIndicator.pingCheck('mongoDB');
    const status = { mongoState: mongoState.mongoDB.status };


    const config = {
      url: 'ldap://AD-N-19-1.marinha.pt',
      //searchDN: 'CN=harbour,OU=DevSecurityGroups,DC=domatica,DC=local',
      baseDN: 'DC=marinha,DC=pt',
      username: 'm0x74951@marinha.pt',
      password: 'inform@20'
    }
    const ad = new ActiveDirectory(config);

    const username = 'm0x74951@marinha.pt';
    const password = 'inform@20';

    ad.authenticate(username, password, function (err, auth) {
      if (err) {
        console.log('ERROR: ' + JSON.stringify(err));
        return;
      }

      if (auth) {
        console.log('Authenticated!');
      }
      else {
        console.log('Authentication failed!');
      }
    });

    const groupName = 'DevAdminGroup';
    ad.isUserMemberOf(username, groupName, function(err, isMember) {
      if (err) {
        console.log('ERROR: ' +JSON.stringify(err));
        return;
      }
     
      console.log(username + ' isMemberOf ' + groupName + ': ' + isMember);
    });

    // Any of the following username types can be searched on
    const sAMAccountName = 'm22286';
    // const userPrincipalName = 'm9830401@marinha.pt';
    // const dn = 'CN=Smith\\, John,OU=Users,DC=domain,DC=com';
    const dn = 'DC=marinha,DC=pt';
    
    // Find user by a sAMAccountName
    ad.findUser(sAMAccountName, function(err, user) {
      if (err) {
        console.log('ERROR: ' +JSON.stringify(err));
        return;
      }
    
      if (! user) console.log('User: ' + sAMAccountName + ' not found.');
      else console.log('detalhes ' + JSON.stringify(user));
    });

    return res.status(200).send(status);
  }

  @Post('status')
  @ApiBearerAuth()
  @ApiOperation({
    description:
      `Manage the api\'s status, restarting the api, etc. No feature is implemented at this time`
  })
  @ApiResponse({ status: 200, description: 'Status updated successfully.' })
  editLoggerLevel(@Body('body') body: object, @Res() res: Response) {
    res.send(getResponse(200));
  }

  @Post('email')
  @ApiBearerAuth()
  @ApiOperation({ description: `Send test email` })
  @ApiResponse({ status: 200, description: 'Status email sent successfully.' })
  testEmail(
    @Body('to') to: string,
    @Res() res: Response
  ) {
    try {
      const params = {
        // headerImageUrl: '../../assets/images/default-domain-image.png',
        headerImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/1200px-PDF_file_icon.svg.png',
        emailToSend: to
      };

      this.mailSender.sendReportEmail(params);
      res.send(getResponse(200));
    } catch (error) {
      res.send(getResponse(400, { data: error }));
    }
  }

  @Get('pdf')
  @ApiBearerAuth()
  @ApiOperation({ description: `Dowload test PDF` })
  @ApiResponse({ status: 200, description: 'PDF sent successfully.' })
  async testPDF(@Res() res: Response) {
    try {
      const users = await this.userService.getAll({});

      const data = [[{ text: 'Email', style: 'tableHeader', alignment: 'center' }, { text: 'Name', style: 'tableHeader', alignment: 'center' }, { text: 'Logins', style: 'tableHeader', alignment: 'center' }]];
      users.forEach((user) => {
        data.push([user.authId, user.name, user.numberOfLogins]);
      });

      const fileName = 'PDF' + uuid() + '.pdf';

      const fonts = {
        Roboto: {
          normal: 'src/assets/fonts/Roboto-Regular.ttf',
          bold: 'src/assets/fonts/Roboto-Medium.ttf',
          italics: 'src/assets/fonts/Roboto-Italic.ttf',
          bolditalics: 'src/assets/fonts/Roboto-MediumItalic.ttf'
        }
      };

      const printer = new PdfPrinter(fonts);

      const docDefinition = {
        content: [
          { text: 'Users', style: 'header' },
          'List of all users registered in this platform.',
          { text: 'List of Users', style: 'subheader' },
          {
            style: 'tableExample',
            table: {
              body: data
            }
          },
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10]
          },
          subheader: {
            fontSize: 16,
            bold: true,
            margin: [0, 10, 0, 5]
          },
          tableExample: {
            margin: [0, 5, 0, 15]
          },
          tableOpacityExample: {
            margin: [0, 5, 0, 15],
            fillColor: 'blue',
            fillOpacity: 0.3
          },
          tableHeader: {
            bold: true,
            fontSize: 13,
            color: 'black'
          }
        },
        defaultStyle: {
          // alignment: 'justify'
        }
      };

      const file = `${__dirname}/${fileName}`;
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      pdfDoc.pipe(
        fs.createWriteStream(file)
      );

      pdfDoc.on('end', () => {
        console.log('file', file);
        setTimeout(() => {
          res.attachment("users.pdf");
          res.contentType('application/pdf');
          res.sendFile(file, () => {
            fs.unlinkSync(file);
          });

        }, 100);
      });

      pdfDoc.end();
    } catch (error) {
      console.log(error);
      return res.send(getResponse(404, { data: error }));
    }
  }
}
