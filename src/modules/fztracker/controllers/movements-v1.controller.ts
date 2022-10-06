import { Controller, Get, Logger, Query, Res, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { Response } from "express";
import { environment } from "../../../config/environment";
import { EntityService } from "../../auth/v1/services/entity.service";
import { AuthGuard } from "../../core/guards/auth.guard";
import { getResponse } from "../../core/helpers/response.helper";
import { SuccessResponseModel } from "../../core/models/success-response.model";
import toSiteHours from "../helpers/site-hours.helper";
import { MovementService } from "../services/movement.service";
import moment = require("moment");

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

      const fromDate = searchFrom
        ? moment(searchFrom).startOf("day")
        : moment()
            .subtract(1, "day")
            .startOf("day");
      const toDate = moment(searchTo).endOf("day");

      filter["movementDate"] = {
        $gte: fromDate.toDate(),
        $lte: toDate.toDate(),
      };

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
    @Query("from") searchFrom: number,
    @Query("to") searchTo: number,
    @Res() res: Response
  ): Promise<object> {
    try {
      this.logger.debug(
        `Input filter: entitySerial=${entitySerial} | searchFrom=${searchFrom} | searchTo=${searchTo}`,
        "site-hours"
      );

      if (!entitySerial) {
        return res.status(400).send({ error: "Missing entitySerial" });
      }

      const entity = await this.entityService.findOne({ serial: entitySerial });
      if (!entity) {
        return res
          .status(404)
          .send({ error: `Entity '${entitySerial}' not fouund.` });
      }

      let filter = {};
      filter = { ...filter, entitySerial };

      if (environment.locations.length > 0) {
        filter = { ...filter, location: { $in: environment.locations } };
      }

      const fromDate = moment(Number(searchFrom) * 1000);
      const toDate = moment(Number(searchTo) * 1000);

      filter["movementDate"] = {
        $gte: fromDate.startOf("day").toDate(),
        $lte: toDate.endOf("day").toDate(),
      };

      // Convert movements into site hours by day
      const siteHours = {
        entitySerial: entity.serial,
        from: moment(fromDate.unix() * 1000),
        to: moment(toDate.unix() * 1000),
        sites: {},
      };

      const daysInWindow =
        moment(toDate.unix() * 1000)
          .startOf("day")
          .diff(moment(fromDate.unix() * 1000).startOf("day"), "day", true) + 1;

      // Loop locations
      if (environment.locations && environment.locations.length > 0) {
        // Initialize sites
        for (const location of environment.locations) {
          siteHours.sites[location] = {
            name: location,
            in: false,
            lastMovement: null,
            lastOut: null,
            lastIn: null,
            daysMap: {},
            days: [],
            totalHours: 0,
            avgHoursDay: 0,
            totalDays: daysInWindow,
          };

          // Get lastMovement before window of search
          const lastMovFilter = {
            entitySerial: entity.serial,
            location: location,
            movementDate: {
              $lt: fromDate.startOf("day").toDate(),
            },
          };

          const lastMovement = await this.movementService.findOneWithSort(
            lastMovFilter,
            { movementDate: -1 }
          );

          if (lastMovement) {
            siteHours.sites[location].in = lastMovement.inOut
              ? lastMovement.inOut
              : false;
            siteHours.sites[location].lastMovement = lastMovement.movementDate
              ? moment(lastMovement.movementDate)
              : null;
          } else {
            siteHours.sites[location].in = false;
            siteHours.sites[location].lastMovement = moment(
              fromDate.unix() * 1000
            ).startOf("day");
          }

          const cDate = moment(fromDate.unix() * 1000).startOf("day");
          for (let i = 0; i < daysInWindow; i++) {
            siteHours.sites[location].daysMap[cDate.format("YYYY-MMM-DD")] = 0;
            cDate.add(1, "day");
          }
        }

        // Replay movements to calculate on site hours
        for (const location of environment.locations) {
          filter["location"] = location;
          const movements = await this.movementService.find(filter, {
            movementDate: 1,
          });

          toSiteHours(siteHours.sites[location], entity, movements);
        }

        // Convert days map to array
        for (const l in siteHours.sites) {
          const site = siteHours.sites[l];
          const cDate = moment(fromDate.unix() * 1000).startOf("day");

          // convert days
          for (let i = 0; i < daysInWindow; i++) {
            const key = cDate.format("YYYY-MMM-DD");
            const hours = Math.round(site.daysMap[key] * 100) / 100;

            siteHours.sites[l].days.push({ date: key, hours: hours });
            siteHours.sites[l].totalHours += hours;

            // Sanity check
            if (siteHours.sites[l].totalHours < 0) {
              console.warn(`Invalid negative hours [${siteHours.sites[l].totalHours}] fix to 0.`);
              siteHours.sites[l].totalHours = 0;
            }

            if (siteHours.sites[l].totalHours > 24) {
              console.warn(`Invalid hours on 1 day [${siteHours.sites[l].totalHours}] fix to 24.`);
              siteHours.sites[l].totalHours = 24;
            }

            // Advance clock 1 day
            cDate.add(1, "day");
          }

          site.avgHoursDay +=
            Math.round(
              (siteHours.sites[l].totalHours / siteHours.sites[l].totalDays) *
                100
            ) / 100;
        }
      }

      const response = getResponse(200, { data: { siteHours } });
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.errmsg });
    }
  }
}
