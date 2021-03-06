import { Body, Controller, Get, Logger, Param, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MongooseHealthIndicator } from '@nestjs/terminus';
import { Response } from 'express';

import { getResponse } from '../core/helpers/response.helper';
import { MailSenderService } from '../core/services/mailsender.service';


import * as fs from 'fs';
import * as PdfPrinter from 'pdfmake';
import * as uuid from 'uuid/v4';
import { UserService } from '../fztracker/services/user.service';
import { AdService } from '../auth/v1/services/ad.service';

@Controller('admin')
@ApiTags('Admin')
export class AdminController {
  constructor(
    private readonly logger: Logger,
    private readonly mailSender: MailSenderService,
    private readonly userService: UserService,
    private readonly adService: AdService,
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
        cardNumber:"m001",
        date:new Date(),
        emailToSend: to,     
      };

      this.mailSender.sendSingnCard(params);
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

  @Post('ad/signin')
  @ApiOperation({ description: 'Return AD auth' })
  @ApiResponse({ status: 200, description: 'Auth sucessfully!' })
  @ApiResponse({ status: 500, description: 'Auth Fail' })
  @ApiBody({})
  async adSignin(
    @Res() res: Response,
    @Body() body: any
  ) {
    const info = await this.adService.authenticate(body.username, body.password);
    console.log('adSignin', info);
    return res.status(200).send(info);
  }

  @Post('ad/find')
  @ApiBody({})
  @ApiOperation({ description: 'find NII in AD' })
  @ApiResponse({ status: 200, description: 'find NII sucessfully!' })
  @ApiResponse({ status: 500, description: 'NII not found ' })
  async adFind(
    @Res() res: Response,
    @Body() body: any
  ) {
    const info = await this.adService.findUser(body.findNII);
    console.log('adFind', info);
    return res.status(200).send(info);
  }


  @Post('ad/ismember')
  @ApiBody({})
  @ApiOperation({ description: 'the NII is member of group?' })
  @ApiResponse({ status: 200, description: 'find NII in group sucessfully!' })
  @ApiResponse({ status: 500, description: 'NII not found in group ' })
  async adismember(
    @Res() res: Response,
    @Body() body: any
  ) {
    const info = await this.adService.isMemberOf(body.username, body.group);
    console.log('adismember', info);
    return res.status(200).send(info);
  }
}


