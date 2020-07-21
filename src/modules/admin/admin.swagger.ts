import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AdminModule } from './admin.module';

export class AdminDocumentation {

  static init(app, routesTree, swaggerCustomization): void {
    const adminMenu = routesTree.find(menu => menu.name === 'Admin');
    const adminOptions = new DocumentBuilder()
      .setTitle(adminMenu.name)
      .setDescription(adminMenu.description)
      .setVersion(adminMenu.children[0].version)
      .addBearerAuth()
      .build();
    const adminDocument = SwaggerModule.createDocument(app, adminOptions, { include: [AdminModule] });
    SwaggerModule.setup(`api/${adminMenu.children[0].path}`, app, adminDocument, swaggerCustomization);
  }
}
