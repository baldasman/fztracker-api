import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FZtrackerModule } from './fztracker.module';


export class FZtrackerDocumentation {
  static init(app, routesTree, swaggerCustomization): void {
    const fztrackerMenu = routesTree.find(menu => menu.name == 'FZtracker');
    const fztrackerOptions = new DocumentBuilder()
      .setTitle(fztrackerMenu.name)
      .setDescription(fztrackerMenu.description)
      .setVersion(fztrackerMenu.children[0].version)
      .addBearerAuth()
      .build();

    const fztrackerDocument = SwaggerModule.createDocument(
      app, fztrackerOptions, { include: [FZtrackerModule] });
    SwaggerModule.setup(
      `api/${fztrackerMenu.children[0].path}`, app, fztrackerDocument,
      swaggerCustomization);
  }
}
