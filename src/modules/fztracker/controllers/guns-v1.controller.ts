import { Body, Controller, Get, Logger, Post, Req, Res,Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { query, Response } from 'express';
import { AuthGuard } from '../../core/guards/auth.guard';
import { getResponse } from '../../core/helpers/response.helper';
import { SuccessResponseModel } from '../../core/models/success-response.model';
import { GunService } from '../services/gun.service';
import { GunsModel } from '../models/guns.model';


@Controller('fztracker/guns/v1')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Guns')
export class GunsV1Controller {
  constructor(
    private readonly logger: Logger,
    private readonly gunService: GunService) {
    this.logger.log('Init Guns@1.0.0 controller', GunsV1Controller.name);
  }

  @Get('getAllGuns')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all guns' })
  @ApiCreatedResponse({ description: 'Successfully returned gun list', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async getGun(
    @Req() req: any,
    @Res() res: Response
  ): Promise<object> {
    try {
      const filter = {};
      const guns = await this.gunService.find(filter);
      //const myGunGuns = guns[0].guns as {name:string, serial:string}[];
      //console.log('guns', filter,guns, myGunGuns[0].name, myGunGuns[0].serial );

      const response = getResponse(200, { data: { guns } });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.errmsg });
    }
  }

  @Get('getAllArmerGuns')
  @ApiOperation({ summary: 'Add new gun to armer' })
  @ApiCreatedResponse({ description: 'Successfully created gun', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async getAllArmerGuns(
    @Query('ArmeiroId') ArmeiroId: string,
 //  @Body() armerModel: GunsModel,
    @Res() res: Response
  ):
    Promise<object> {

    try {
      console.log("add guns to armer", ArmeiroId);
    // const filter = {ArmeiroId: "12"};
     // const filter = {ArmeiroId: armerModel.ArmeiroId};
      const armer = await this.gunService.findOne({ArmeiroId: ArmeiroId});
      console.log("armerr", armer);
      // if no armer return

   /*    const gunsInArmer = armer.guns as {name:string, serial:string}[];

      const gunsToAdd = armerModel.guns as {name:string, serial:string}[];
      gunsToAdd.forEach(gun => {
        if (gun.serial) {
          const idx = gunsInArmer.findIndex(gunInArmer => gunInArmer.serial === gun.serial);
          console.log("find", idx, gun.serial);
          if (idx < 0) {
            // add missing gun
            gunsInArmer.push(gun);
            console.log("add gun", gun, gunsInArmer);
            // to remove remove
            // gunsInArmer.splice(idx, 1);
          }
          
        }
        
      }); */
      
      // Update armer
    /*  armer.guns = gunsInArmer;
      const armerChanges = await this.gunService.updateOne(armer);
      console.log("armerr", armerChanges);
      const response = getResponse(200, { data: armerChanges }); */
      const response = getResponse(200, { data: { armer } });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);

      if (error.code == 11000) {
        return res.status(400).send({ error: error.errmsg });
      }

      return res.status(400).send({ error: error });
    }


  }

  @Post('addgun')
  @ApiOperation({ summary: 'Add new gun' })
  @ApiCreatedResponse({ description: 'Successfully created gun', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async addGun(
    @Body() gun: GunsModel,
    @Res() res: Response
  ):
    Promise<object> {

    try {
      console.log("add gun", gun);
      const newGun = await this.gunService.add(gun);

      // Add log
      return res.status(200).send({ data: newGun });
    } catch (error) {
      console.error(error);

      if (error.code == 11000) {
        return res.status(400).send({ error: error.errmsg });
      }

      return res.status(400).send({ error: error });
    }


  }

  @Post('addguntoarmer')
  @ApiOperation({ summary: 'Add new gun to armer' })
  @ApiCreatedResponse({ description: 'Successfully created gun', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async addGunsToArmer(
    @Body() armerModel: GunsModel,
    @Res() res: Response
  ):
    Promise<object> {

    try {
      console.log("add guns to armer", armerModel);

      const filter = {ArmeiroId: armerModel.ArmeiroId};
      const armer = await this.gunService.findOne(filter);
      console.log("armerr", armer);
      // if no armer return

      const gunsInArmer = armer.guns as {name:string, serial:string}[];

      const gunsToAdd = armerModel.guns as {name:string, serial:string}[];
      gunsToAdd.forEach(gun => {
        if (gun.serial) {
          const idx = gunsInArmer.findIndex(gunInArmer => gunInArmer.serial === gun.serial);
          console.log("find", idx, gun.serial);
          if (idx < 0) {
            // add missing gun
            gunsInArmer.push(gun);
            console.log("add gun", gun, gunsInArmer);
            // to remove remove
            // gunsInArmer.splice(idx, 1);
          }
          
        }
        
      });
      
      // Update armer
      armer.guns = gunsInArmer;
      const armerChanges = await this.gunService.updateOne(armer);
      console.log("armerr", armerChanges);
      const response = getResponse(200, { data: armerChanges });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);

      if (error.code == 11000) {
        return res.status(400).send({ error: error.errmsg });
      }

      return res.status(400).send({ error: error });
    }


  }

  @Post('removeguntoarmer')
  @ApiOperation({ summary: 'Add new gun to armer' })
  @ApiCreatedResponse({ description: 'Successfully created gun', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async removeGunsToArmer(
    @Body() armerModel: GunsModel,
    @Res() res: Response
  ):
    Promise<object> {

    try {
      console.log("add guns to armer", armerModel);

      const filter = {ArmeiroId: armerModel.ArmeiroId};
      const armer = await this.gunService.findOne(filter);
      console.log("armer", armer);
      // if no armer return

      const gunsInArmer = armer.guns as {name:string, serial:string}[];

      const gunsToAdd = armerModel.guns as {name:string, serial:string}[];
      gunsToAdd.forEach(gun => {
        if (gun.serial) {
          const idx = gunsInArmer.findIndex(gunInArmer => gunInArmer.serial === gun.serial);
          console.log("find", idx, gun.serial);
          if (idx >= 0) {
            // add missing gun
            
            console.log("remove gun", gun, gunsInArmer);
            // to remove remove
            gunsInArmer.splice(idx, 1);
          }  
        }
        
      });
      
      // Update armer
      armer.guns = gunsInArmer;
      const armerChanges = await this.gunService.updateOne(armer);
      console.log("armerr", armerChanges);
      const response = getResponse(200, { data: armerChanges });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);

      if (error.code == 11000) {
        return res.status(400).send({ error: error.errmsg });
      }

      return res.status(400).send({ error: error });
    }


  }

}
