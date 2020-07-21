import { Injectable, Logger } from '@nestjs/common';
import { renderFile } from 'ejs';
import { readFileSync } from 'fs';
import { join } from 'path';
import getRoutesTree from './config/routes';


@Injectable()
export class AppService {
  constructor(private readonly logger: Logger) {}

  getIndexPages(req, res) {
    this.logger.setContext(AppService.name);

    const routesTree = getRoutesTree();

    const urlParts = req.url.split('/');
    const namespace = urlParts[2];

    const routes = !namespace ?
        routesTree :
        routesTree.find(r => r.path.includes(namespace));

    const templateUrl =
        join(__dirname, './assets/views/documentation-index-pages/index.ejs');

    // need to make this dynamic by using the brandImage configuration
    const filePath = `${__dirname}/assets/images/default-domain-image.png`;
    let headerImage;
    try {
      headerImage = readFileSync(filePath).toString('base64');
    } catch (e) {
      this.logger.error('Missing the header image');
    }

    return renderFile(templateUrl, {routes, headerImage}, (err, data) => {
      if (err) {
        this.logger.error('Invalid routes or file');
        return res.sendFile(
            '/assets/views/documentation-index-pages/not-found.html',
            {root: __dirname});
      }

      return res.send(data);
    });
  }
}
