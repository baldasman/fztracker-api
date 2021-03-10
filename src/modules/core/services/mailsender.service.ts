import { Injectable, Logger } from '@nestjs/common';
import { renderFile } from 'ejs';
import * as fs from 'fs';
import { createTransport } from 'nodemailer';
import { join } from 'path';
import { environment } from '../../../config/environment';

@Injectable()
export class MailSenderService {
  private readonly loggerContext = MailSenderService.name;

  /* private transport = createTransport({
    service: 'gmail',
    auth: {
      user: environment.smtpEmail,
      pass: environment.smtpPassword,
    }
  }); */


 /*  $EmailFrom = “csie.config@marinha.pt”

$EmailTo = “moreira.sousa@marinha.pt”

$Subject = “teste de mail”

$Body = “um fui ao jardim da celeste”

$SMTPServer = “smtp.marinha.pt”

$SMTPClient = New-Object Net.Mail.SmtpClient($SmtpServer, 587)

$SMTPClient.EnableSsl = $true

$SMTPClient.Credentials = New-Object System.Net.NetworkCredential(“m0x74951”, “inform@20”);

$SMTPClient.Send($EmailFrom, $EmailTo, $Subject, $Body) */


   private transport = createTransport({
    host: 'smtp.marinha.pt', // Office 365 server
     port: 587,     // secure SMTP
    secure: false, 
    requireTLS: true,
    // false for TLS - as a boolean not string - but the
    auth: {
        user: environment.smtpEmail,
        pass: environment.smtpPassword
   },
   tls: {
    rejectUnauthorized: false
  }
       });
     
/*   private transport = createTransport({
    host: environment.smtpHost,
    port: 587,
    secure: false,
   // requireTLS: false,
    auth: {
      user: environment.smtpEmail,
      pass: environment.smtpPassword
    }
  }); */

  constructor(private readonly logger: Logger) {
    console.log(this.transport);
  }

  sendReportEmail(locals) {
    const template = 'testEmail';

    const templateUrl =
      join(__dirname, `../../../assets/templates/${template}.ejs`);

    renderFile(templateUrl, locals, (err, data) => {
      if (err) {
        this.logger.error(
          `Error while trying to render file ${template}.ejs`,
          this.loggerContext, err);
        return;
      } else {
        console.log('sendTestEmail', __dirname);

        const mainOptions = {
          from: environment.smtpEmail,
          to: locals.emailToSend,
          subject: 'Test Email for PDS',
          html: data,
          attachments: [
            {
              // file on disk as an attachment
              filename: locals.reportName,
              path: locals.reportPath  // stream this file
            },
          ]
        };
        console.log("a enviar",locals.emailToSend), data;
        return this.transport.sendMail(mainOptions, (error) => {
          if (error) {
            console.log(error);
            this.logger.error(
              `Error while trying to render file ${template}.ejs`,
              this.loggerContext);
          }

          fs.unlinkSync(locals.reportPath);
          console.log("enviado",locals.emailToSend);
        });
      }
    });
  }

  sendInviteEmail(locals) {
    const templateUrl =
      join(__dirname, '../../../assets/templates/testEmail.ejs');
    renderFile(
      templateUrl, {
        headerImageUrl: locals.headerImageUrl,
      confirmationCode: locals.confirmationCode,
      activationUrl: locals.activationUrl
    },
      (err, data) => {
        if (err) {

          console.error(err);
          this.logger.error(
            'Error while trying to render file inviteRegister.ejs',
            this.loggerContext);
          return;
        } else {
          const mainOptions = {
            from: 'csie.config@marinha.pt',
            to: locals.emailToSend,
            subject: 'Invite',
            html: data
          };
          console.log("a enviar",locals.emailToSend, data);
          return this.transport.sendMail(mainOptions, (error) => {
            if (error) {
              console.error(error);
              this.logger.error(
                'Error while trying to send invite register email',
                this.loggerContext);
               
            } else { console.log("a enviado",locals.emailToSend)}
          });
        }
      });
  }

  sendInviteInformationEmail(locals) {
    const templateUrl =
      join(__dirname, '../../../assets/templates/inviteInformationEmail.ejs');
    renderFile(templateUrl, { userEmail: locals.newUserEmail }, (err, data) => {
      if (err) {
        this.logger.error(
          'Error while trying to render file inviteInformationEmail.ejs',
          this.loggerContext);
        return;
      } else {
        const mainOptions = {
          from: '',
          to: locals.emailToSend,
          subject: 'Invite sent',
          html: data
        };
        return this.transport.sendMail(mainOptions, (error) => {
          if (error) {
            this.logger.error(
              'Error while trying to send invite information email',
              this.loggerContext);
          }
        });
      }
    });
  }

  sendWarningEmail(locals) {
    const templateUrl =
      join(__dirname, '../../../assets/templates/warningEmail.ejs');
    renderFile(templateUrl, { serviceName: locals.serviceName }, (err, data) => {
      if (err) {
        this.logger.error(
          'Error while trying to render file warningEmail.ejs',
          this.loggerContext);
        return;
      } else {
        const mainOptions =
          { from: '', to: locals.emailToSend, subject: 'Warning', html: data };
        return this.transport.sendMail(mainOptions, (error) => {
          if (error) {
            this.logger.error(
              'Error while trying to send confirmation account email',
              this.loggerContext);
          }
        });
      }
    });
  }

  sendSignUpNotificationEmail(locals) {
    const templateUrl =
      join(__dirname, '../../../assets/templates/signUpNotification.ejs');
    console.log(templateUrl);
    renderFile(
      templateUrl, {
      activationUrl: locals.activationUrl,
      userEmail: locals.userEmail,
      userName: locals.userName,
      headerImageUrl:
        'https://info.vost.pt/wp-content/uploads/2020/04/Open4Business_Header_NewLogo.png'
    },
      (err, data) => {
        if (err) {
          this.logger.error(
            'Error while trying to render file signUpNotification.ejs',
            this.loggerContext);
          return;
        } else {
          const mainOptions = {
            from: '"Open4Business by VOSTPT"<no-reply@vost.pt>',
            to: locals.emailToSend,
            subject: 'Nova empresa registada',
            html: data
          };

          return this.transport.sendMail(mainOptions, (error) => {
            if (error) {
              console.log(error);
              this.logger.error(
                'Error while trying to send confirmation account email',
                this.loggerContext);
            }
          });
        }
      });
  }

  sendRecoverEmail(locals) {
    const templateUrl =
      join(__dirname, '../../../assets/templates/recoverPassword.ejs');
    renderFile(templateUrl, { resetUrl: locals.resetUrl }, (err, data) => {
      if (err) {
        this.logger.error(
          'Error while trying to render file recoverPassword.ejs',
          this.loggerContext);
        return;
      } else {
        const mainOptions = {
          from: '',
          to: locals.emailToSend,
          subject: 'Recover password',
          html: data
        };
        return this.transport.sendMail(mainOptions, (error) => {
          if (error) {
            this.logger.error(
              'Error while trying to send confirmation account email',
              this.loggerContext);
          }
        });
      }
    });
  }

  sendPortalInviteEmail(locals) {
    const templateUrl =
      join(__dirname, '../../../assets/templates/portalInviteEmail.ejs');
    renderFile(templateUrl, { registerUrl: locals.registerUrl }, (err, data) => {
      if (err) {
        this.logger.error(
          'Error while trying to render file portalInviteEmail.ejs',
          this.loggerContext);
        return;
      } else {
        const mainOptions = {
          from: '',
          to: locals.emailToSend,
          subject: 'Portal invite',
          html: data
        };
        return this.transport.sendMail(mainOptions, (error) => {
          if (error) {
            this.logger.error(
              'Error while trying to send portal invite email',
              this.loggerContext);
          }
        });
      }
    });
  }

  sendAccountConfirmedEmail(locals) {
    const templateUrl =
      join(__dirname, '../../../assets/templates/accountConfirmedEmail.ejs');
    renderFile(
      templateUrl, {
      ...locals,
      headerImageUrl:
        'https://info.vost.pt/wp-content/uploads/2020/04/Open4Business_Header_NewLogo.png'
    },
      (err, data) => {
        if (err) {
          this.logger.error(
            'Error while trying to render file accountConfirmedEmail.ejs',
            this.loggerContext, err);
          return;
        } else {
          const mainOptions = {
            from: '"Open4Business by VOSTPT"<no-reply@vost.pt>',
            to: locals.emailToSend,
            subject: 'Conta confirmada',
            html: data
          };
          return this.transport.sendMail(mainOptions, (error) => {
            if (error) {
              this.logger.error(
                'Error while trying to send account confirmed email',
                this.loggerContext);
            }
          });
        }
      });
  }

  sendImportNotificationEmail(locals) {
    const templateUrl =
      join(__dirname, '../../../assets/templates/importNotification.ejs');

    renderFile(
      templateUrl, {
      ...locals,
      headerImageUrl:
        'https://info.vost.pt/wp-content/uploads/2020/04/Open4Business_Header_NewLogo.png'
    },
      (err, data) => {
        if (err) {
          this.logger.error(
            'Error while trying to render file confirmAccount.ejs',
            this.loggerContext, err);
          return;
        } else {
          const mainOptions = {
            from: '"Open4Business by VOSTPT"<no-reply@vost.pt>',
            to: locals.emailToSend,
            subject: `Lojas ${locals.status}: ${locals.company}`,
            html: data
          };
          return this.transport.sendMail(mainOptions, (error) => {
            if (error) {
              console.log(error);
              this.logger.error(
                'Error while trying to send upload locations email',
                this.loggerContext);
            }
          });
        }
      });
  }

  sendImportConfirmationEmail(locals) {
    const templateUrl =
      join(__dirname, '../../../assets/templates/importConfirmation.ejs');

    if (locals.confirm) {
      locals.action = 'já estão ativas';
      locals.result = 'aprovadas';
    } else {
      locals.action = 'foram rejeitadas e estão à espera de ser revistas.';
      locals.result = 'rejeitadas';
    }

    renderFile(
      templateUrl, {
      ...locals,
      headerImageUrl:
        'https://info.vost.pt/wp-content/uploads/2020/04/Open4Business_Header_NewLogo.png'
    },
      (err, data) => {
        if (err) {
          this.logger.error(
            'Error while trying to render file confirmAccount.ejs',
            this.loggerContext, err);
          return;
        } else {
          const mainOptions = {
            from: '"Open4Business by VOSTPT"<no-reply@vost.pt>',
            to: locals.emailToSend,
            subject: `Lojas Importadas: ${locals.result}`,
            html: data
          };

          return this.transport.sendMail(mainOptions, (error) => {
            if (error) {
              console.error('sendMail: ImportConfirmationEmail', error);
              this.logger.error(
                'Error while trying to send locations review account email',
                this.loggerContext);
            }
          });
        }
      });
  }

  sendSingnCard(locals) {
    const templateUrl =
      join(__dirname, '../../../assets/templates/singnCard.ejs');
    renderFile(
      templateUrl, 
      locals,
    
      (err, data) => {
        if (err) {

          console.error(err);
          this.logger.error(
            'Error while trying to render file inviteRegister.ejs',
            this.loggerContext);
          return;
        } else {
          const mainOptions = {
            from: 'csie.config@marinha.pt',
            to: locals.emailToSend,
            subject: 'Cartao Atribuido',
            html: data
          };
      
          return this.transport.sendMail(mainOptions, (error) => {
            if (error) {
              console.error(error);
              this.logger.error(
                'Error while trying to send invite register email',
                this.loggerContext);
               
            } else { console.log("email do cartao enviado",locals.emailToSend)}
          });
        }
      });
  }



}
