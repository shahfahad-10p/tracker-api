const { pool } = require("../../queries");
const booleanPointInPolygon = require("@turf/boolean-point-in-polygon").default;
const { point, polygon } = require("@turf/helpers");
const { sendEmail } = require("../services/email");

const getTrackers = (request, response) => {
  pool.query(`SELECT * FROM tracker;`, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json({ trackers: results.rows });
  });
};

const getTrackerGeoJson = async (request, response) => {
  const trackerName = request.params.name;

  try {
    console.log("GET GEOJSON PARAMS : ", trackerName);
    const dbResult = await pool.query(`SELECT * FROM archive WHERE name=$1;`, [
      trackerName,
    ]);

    const geojson = {
      type: "FeatureCollection",
      features: [],
    };

    dbResult.rows.forEach((event) => {
      const feature = {
        type: "Feature",
        properties: {
          name: event.name,
        },
        geometry: {
          type: "Point",
          coordinates: [event.longitude, event.latitude],
        },
      };
      geojson.features.push(feature);
    });

    console.log("GET GEOJSON : ", geojson);
    response.status(200).json(geojson);
  } catch (error) {}
};

const addTracker = async (request, response) => {
  const { name, email } = request.body;

  console.log("ON ADD TRACKER REQUEST", name, email);

  try {
    pool.query(
      `INSERT INTO public.tracker 
      ("name", email) 
      VALUES($1, $2) RETURNING *;`,
      [name, email],
      (error, results) => {
        if (error) {
          if (error.constraint === "tracker_pk") {
            console.log("ON INSERT TRACKER : DUPLICATE ERROR ", error);
            const errorResponse = {
              error: "duplicate",
              code: 409,
              message: "Tracker already exist",
            };
            response.status(409).json(errorResponse);
          }
        } else {
          console.log("ON INSERT TRACKER SUCCESS: ", results.rows[0]);
          response.status(200).json(results.rows[0]);
        }
      }
    );
  } catch (error) {}
};

const setTracker = async (request, response) => {
  const { name, latitude, longitude, dateTime } = request.body;
  let regions = [];

  try {
    await pool.query(
      `INSERT INTO public.tracker ("name", latitude, longitude)
      VALUES($1, $2, $3)
      on conflict (name)
      do
        UPDATE set latitude=$2, longitude=$3 RETURNING *;`,
      [name, latitude, longitude],
      (error, results) => {}
    );

    await pool.query(
      `INSERT INTO public.archive ("name", latitude, longitude, date_time, date_time_z)
      VALUES($1, $2, $3, $4, $5) RETURNING *`,
      [name, latitude, longitude, dateTime, dateTime]
    );

    await pool.query(`SELECT * FROM regions;`, (error, results) => {
      if (error) {
        throw error;
      }
      regions = results.rows;

      const pointToCheck = point([longitude, latitude]);

      regions.every((region) => {
        const polyStringArray = region.polygon.split(";");
        let polyArray = [];
        polyStringArray.forEach((item) =>
          polyArray.push(item.split(",").map((coord) => parseFloat(coord)))
        );
        const polygonToCheck = polygon([polyArray]);
        const isPointInPoly = booleanPointInPolygon(
          pointToCheck,
          polygonToCheck
        );

        if (isPointInPoly) {
          const emailContent = `Tracker : ${name}, Region : ${region.name}`;
          sendEmail(emailContent);

          console.log("POINT IN POLY : ", pointToCheck, region.name);

          return false;
        }
        return true;
      });

      response.status(200).json(request.body);
    });
  } catch (error) {
    if (error) {
      response.status(400).json(error);
      throw error;
    }
  }
};

module.exports = {
  getTrackers,
  addTracker,
  setTracker,
  getTrackerGeoJson,
};
