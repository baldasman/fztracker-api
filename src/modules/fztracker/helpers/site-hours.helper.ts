import moment = require("moment");
import { EntityModel } from "../../auth/v1/models/entity.model";
import { MovementModel } from "../models/movement.model";

const toSiteHours = (
  entity: EntityModel,
  from: number,
  to: number,
  movements: MovementModel[],
  locations: string[]
) => {
  const siteHours = {
    entitySerial: entity.serial,
    from,
    to,
    sites: {},
  };

  const sites = {};

  if (!movements || movements.length == 0) {
    return siteHours;
  }

  // Initialize sites
  const fromDate = moment(from).startOf("day");
  const toDate = moment(to).startOf("day");
  const days = toDate.diff(fromDate, "day") + 1;

  console.log("toSiteHours", fromDate, toDate, locations, days);

  // Initialize sites from Locations
  locations.forEach((site) => {
    if (!sites[site]) {
      sites[site] = {
        name: site,
        in: entity.inOut,
        lastMovement: null,
        days: {},
      };

      // Add start
      const cDate = moment(fromDate);
      sites[site].days[cDate.format("YYYY-MMM-DD")] = 0;

      for (let i = 1; i < days; i++) {
        const d = cDate.add(1, "day");
        sites[site].days[d.format("YYYY-MMM-DD")] = 0;
      }
    }
  });

  for (const movement of movements) {
    // Get site
    const site = sites[movement.location];
    if (!site) {
      continue;
    }

    const mDate = moment(movement.movementDate);

    if (!site.lastMovement) {
      site.lastMovement = moment(entity.lastMovementDate);
    }

    
    if (movement.inOut === false) { // Found OUT
      console.log(`Out from ${site.name} at ${movement.movementDate}`);

      if (site.in === true) {
        // Was inside
        console.log(" was inside");

        // Get days
        const days = mDate.diff(site.lastMovement, "day", true);

        if (days > 1) {
          console.log("   in and out on different days", days);

          // Add time from entry till end of day of entrance
          let hours = moment(site.lastMovement)
            .endOf("day")
            .diff(moment(site.lastMovement), "hour", true);
          site.days[site.lastMovement.format("YYYY-MMM-DD")] += hours;

          console.log(`     add ${hours} on entry day ${site.lastMovement.format("YYYY-MMM-DD")}`);

          // Loop full days before exit and add 24h
          let cDate = moment(site.lastMovement).startOf('day');
          for (let i = 0; i < days - 1; i++) {
            cDate.add(1, "day");

            site.days[cDate.format("YYYY-MMM-DD")] += 24;
            console.log(`     add 24h on ${cDate.format("YYYY-MMM-DD")}`);
          }

          cDate.add(1, "day");
          hours = mDate.diff(cDate.startOf("day"), "hour", true);
          site.days[cDate.format("YYYY-MMM-DD")] += hours;

          console.log(`     add ${hours} on exit day ${cDate.format("YYYY-MMM-DD")}`);
        } else {
          console.log("   in and out same day", days);

          const hours = mDate.diff(site.lastMovement, "hour", true);

          console.log(
            `     add ${hours} working hours to ${mDate.format("YYYY-MMM-DD")}`
          );

          site.days[mDate.format("YYYY-MMM-DD")] += hours;
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
            site.days[d.format("YYYY-MMM-DD")] = { d, hours: 24 };
          }

          const lDay = cDate.add(1, "day");
          const hours = lDay.diff(lDay.startOf("day"), "hour", true);
          site.days[lDay.format("YYYY-MMM-DD")] += hours;
        }
      }

      site.in = true;
      site.lastMovement = mDate;
      site.lastIn = mDate.toISOString();
    } else {
      console.warn(`Invalid inOut value '${movement.inOut}'.`);
    }
  }

  for (const l in sites) {
    siteHours.sites[l] = {
      name: l,
      in: sites[l].in,
      lastMovement: sites[l].lastMovement,
      lastOut: sites[l].lastOut,
      lastIn: sites[l].lastIn,
      days: [],
      totalHours: 0,
      avgHoursDay: 0,
      totalDays: days,
    };

    // convert days
    const cDate = moment(fromDate);
    let key = cDate.format("YYYY-MMM-DD");
    let hours = Math.round(sites[l].days[key] * 100) / 100;

    siteHours.sites[l].days.push({ date: key, hours: hours });
    siteHours.sites[l].totalHours += hours;

    for (let i = 1; i < days; i++) {
      cDate.add(1, "day");
      key = cDate.format("YYYY-MMM-DD");
      hours = Math.round(sites[l].days[key] * 100) / 100;

      siteHours.sites[l].days.push({ date: key, hours });
      siteHours.sites[l].totalHours += hours;
    }

    siteHours.sites[l].avgHoursDay +=
      Math.round(
        (siteHours.sites[l].totalHours / siteHours.sites[l].totalDays) * 100
      ) / 100;
  }

  return siteHours;
};

export default toSiteHours;
