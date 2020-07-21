import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AuthV1Module } from './v1/auth-v1.module';

export class AuthDocumentation {

  static init(app, routesTree, swaggerCustomization): void {
    const authMenu = routesTree.find(menu => menu.name === 'Auth');
    const authOptions = new DocumentBuilder()
      .setTitle(authMenu.name)
      .setDescription(authMenu.description)
      .setVersion(authMenu.children[0].version)
      .addBearerAuth()
      .build();
    const authDocument = SwaggerModule.createDocument(app, authOptions, { include: [AuthV1Module] });
    SwaggerModule.setup(`api/${authMenu.children[0].path}`, app, authDocument, swaggerCustomization);
  }
}
