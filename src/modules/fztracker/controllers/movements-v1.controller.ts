import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Response } from "express";
import moment = require("moment");
import { environment, Environment } from "../../../config/environment";
import { EntityService } from '../../auth/v1/services/entity.service';
import { AuthGuard } from "../../core/guards/auth.guard";
import { getResponse } from "../../core/helpers/response.helper";
import { SuccessResponseModel } from "../../core/models/success-response.model";
import toSiteHours from '../helpers/site-hours.helper';
import { MovementService } from "../services/movement.service";

@Controller("fztracker/movements/v1")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags("Movements")
export class MovementsV1Controller {
  constructor(
    private readonly logger: Logger,
    private readonly movementService: MovementService,
    private readonly entityService: EntityService
  ) {
    this.logger.log(
      "Init Movements@1.0.0 controller",
      MovementsV1Controller.name
    );
  }

  @Get("")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all movements" })
  @ApiCreatedResponse({
    description: "Successfully returned card movements",
    type: SuccessResponseModel,
  })
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  async getMoviments(
    @Query("search") search: string,
    @Query("from") searchFrom: string,
    @Query("to") searchTo: string,
    @Query("local") searchLocal: string,
    @Res() res: Response
  ): Promise<object> {
    try {
      console.log("filtros", search, searchFrom, searchTo, searchLocal);
      let filter = {};

      if (searchLocal) {
        filter = { ...filter, location: searchLocal };
      }

      if (search) {
        filter = { ...filter, entitySerial: search };
      }

      const fromDate = moment(searchFrom).startOf("day");
      const toDate = moment(searchTo).endOf("day");

      filter["movementDate"] = {
        $gte: fromDate.toDate(),
        $lte: toDate.toDate(),
      };

      console.log("filter", filter);
      const movements = await this.movementService.find(filter);

      const response = getResponse(200, { data: { movements } });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.errmsg });
    }
  }

  @Get("site-hours")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get workday statistics" })
  @ApiCreatedResponse({
    description: "Successfully returned workday statistics",
    type: SuccessResponseModel,
  })
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  async getSiteHours(
    @Query("entitySerial") entitySerial: string,
    @Query("from") searchFrom: string,
    @Query("to") searchTo: string,
    @Res() res: Response
  ): Promise<object> {
    try {
      console.log("Input filter", entitySerial, searchFrom, searchTo);

      if (!entitySerial) {
        return res.status(400).send({ error: "Missing entitySerial" });
      }

      const entity = await this.entityService.findOne({ 'serial': entitySerial });
      if (!entity) {
        return res.status(404).send({ error: `Entity '${entitySerial}' not fouund.` });
      }

      let filter = {};
      filter = { ...filter, entitySerial };

      if (environment.locations.length > 0) {
        filter = { ...filter, location: { $in: environment.locations } };
      }

      const fromDate = moment(searchFrom);
      const toDate = moment(searchTo);

      filter["movementDate"] = {
        $gte: fromDate.startOf('day').toDate(),
        $lte: toDate.endOf('day').toDate(),
      };

      console.log("Query filter", filter);
      const movements = await this.movementService.find(filter, {movementDate: 1});

      // Convert movements into site hours by day
      const siteHours = toSiteHours(entity, fromDate.toString(), toDate.toString(), movements, environment.locations);

      const response = getResponse(200, { data: { siteHours } });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.errmsg });
    }
  }
}
