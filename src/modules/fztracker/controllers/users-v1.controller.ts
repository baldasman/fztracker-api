import { Body, Controller, Get, Logger, Put, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '../../core/guards/auth.guard';
import { SuccessResponseModel } from '../../core/models/success-response.model';
import { UserService } from '../services/user.service';


@Controller('fztracker/users/v1')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Users')
export class UsersV1Controller {
  constructor(
    private readonly logger: Logger,
    private readonly userService: UserService) {
    this.logger.log('Init Users@1.0.0 controller', UsersV1Controller.name);
  }

  @Get('')
  @ApiOperation({ summary: 'Get list of users' })
  @ApiOkResponse({ description: 'Hello is valid', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Token isn\'t valid' })
  @ApiQuery({ name: 'name', description: 'name to filter users', type: String, required: true })
  async getAllUsers(
    @Query('name') name: string,
    @Res() res: Response
  ): Promise<object> {
    const exp = new RegExp('.*' + name + '.*', 'i');
    const filter = name ? { 'name': { $regex: exp } } : {};

    const users = await this.userService.getAll(filter);

    const response = { data: { rows: users.length, users } };
    return res.status(200).send(response);
  }

  @Put('')
  @ApiOperation({ summary: 'Update user info' })
  @ApiCreatedResponse({ description: 'Successfully updated user info', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async postUser(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('isActive') isActive: boolean,
    @Res() res: Response
  ):
    Promise<object> {
    const changes: any = {};

    if (!email) {
      return res.status(400).send({ error: 'Field "email" is required.' });
    }

    if (name) {
      changes.name = name;
    }

    if (isActive != null) {
      changes.isActive = isActive;
    }

    const status = await this.userService.update(email, changes);
    const user = await this.userService.get(email);
    const response = { data: { user, status } };

    return res.status(200).send(response);
  }

  @Get('info')
  @ApiOperation({ summary: 'Get server hello' })
  @ApiOkResponse({ description: 'Hello is valid', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Token isn\'t valid' })
  @ApiQuery({ name: 'authId', description: 'The authId to describe', type: String, required: true })
  async getUserInfo(
    @Query('authId') authId: string,
    // @Param('authId') authId: string,
    @Res() res: Response
  ): Promise<object> {
    // TODO: read from database user info

    // TODO: read from mongo

    const response = { data: { authId, isActive: true, languageKey: 'en' } };
    return res.status(200).send(response);
  }

  @Get('export')
  @ApiOperation({ summary: 'Get csv file qith list of users' })
  @ApiOkResponse({ description: 'Hello is valid', type: SuccessResponseModel })
  @ApiUnauthorizedResponse({ description: 'Token isn\'t valid' })
  @ApiQuery({ name: 'name', description: 'name to filter users', type: String, required: true })
  async exportAllUsers(
    @Query('name') name: string,
    @Res() res: Response
  ): Promise<object> {
    const exp = new RegExp('.*' + name + '.*', 'i');
    const filter = name ? { 'name': { $regex: exp } } : {};

    const users = await this.userService.getAll(filter);

    let data = '';
    users.forEach((user) => {
      data += `${user.authId},${user.name}\n`;
    });

    console.log('users', data);

    res.attachment('users.csv');
    res.contentType('text/csv');
    return res.status(200).send(data);
  }
}
