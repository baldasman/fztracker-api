import moment = require("moment");
import { EntityModel } from "../../auth/v1/models/entity.model";
import { MovementModel } from "../models/movement.model";

const toSiteHours = (
  site: any,
  entity: EntityModel,
  movements: MovementModel[]
) => {
  if (!movements || movements.length == 0) {
    return;
  }

  console.log(
    `**** ${entity.serial} was ${site.in ? "IN" : "OUT"} from ${site.name} on ${
      site.lastMovement
    } ****`
  );

  for (const movement of movements) {
    const mDate = moment(movement.movementDate);

    if (movement.inOut === false) {
      // Found OUT
      console.log(`Out from ${site.name} at ${movement.movementDate}`);

      if (site.in === true) {
        // Was inside
        console.log(" was inside");

        // Check if in and out on same day
        if (mDate.format("YYYYMMDD") != site.lastMovement.format("YYYYMMDD")) {
          const daysInOut = mDate
            .clone()
            .startOf("day")
            .diff(site.lastMovement.clone().startOf("day"), "day");
          console.log("   in and out on different days", daysInOut);

          // Add time from entry till end of day of entrance
          let hours = moment(site.lastMovement)
            .endOf("day")
            .diff(moment(site.lastMovement), "hour", true);
          site.daysMap[site.lastMovement.format("YYYY-MMM-DD")] += hours;

          console.log(
            `     add ${hours} on entry day ${site.lastMovement.format(
              "YYYY-MMM-DD"
            )}`
          );

          // Loop full days before exit and add 24h
          let cDate = moment(site.lastMovement).startOf("day");
          for (let i = 0; i < daysInOut - 1; i++) {
            cDate.add(1, "day");

            site.daysMap[cDate.format("YYYY-MMM-DD")] += 24;
            console.log(`     add 24h on ${cDate.format("YYYY-MMM-DD")}`);
          }

          cDate.add(1, "day");
          hours = mDate.diff(cDate.startOf("day"), "hour", true);
          site.daysMap[cDate.format("YYYY-MMM-DD")] += hours;

          console.log(
            `     add ${hours} on exit day ${cDate.format("YYYY-MMM-DD")}`
          );
        } else {
          console.log("   in and out same day");

          const hours = mDate.diff(site.lastMovement, "hour", true);

          console.log(
            `     add ${hours} working hours to ${mDate.format("YYYY-MMM-DD")}`
          );

          site.daysMap[mDate.format("YYYY-MMM-DD")] += hours;
        }
      } else {
        // Already outside
        console.log("already out, nothing to do.", movement.uid);
      }

      site.in = false;
      site.lastMovement = mDate;
      site.lastOut = mDate.toISOString();
    } else if (movement.inOut === true) {
      // Found IN
      console.log(`In from ${site.name} at ${movement.movementDate}`);

      if (site.in === true) {
        // Was inside
        console.log(" was inside. Add hours since last in");

        // Get days
        const days = site.lastMovement.diff(mDate, "day");

        if (days === 0) {
          console.log("   in and out same day");
        } else {
          console.log("   in and different days");

          let cDate = moment(site.lastMovement);
          for (let i = 1; i < days - 1; i++) {
            const d = cDate.add(1, "day");
            site.daysMap[d.format("YYYY-MMM-DD")] = { d, hours: 24 };
          }

          const lDay = cDate.add(1, "day");
          const hours = lDay.diff(lDay.startOf("day"), "hour", true);
          site.daysMap[lDay.format("YYYY-MMM-DD")] += hours;
        }
      }

      site.in = true;
      site.lastMovement = mDate;
      site.lastIn = mDate.toISOString();
    } else {
      console.warn(`Invalid inOut value '${movement.inOut}'.`);
    }
  }
};

export default toSiteHours;
