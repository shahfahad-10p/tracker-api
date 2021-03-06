const { pool } = require("../../queries");
const booleanPointInPolygon = require("@turf/boolean-point-in-polygon").default;
const { point, polygon } = require("@turf/helpers");
const { sendEmail } = require("../services/email");

const getTrackers = (request, response) => {
  pool.query(
    `SELECT t.*, t.date_time as "lastSeen", r.name as "regionName" from tracker t LEFT OUTER JOIN regions r ON t.region_id = r.id ORDER BY t.id;`,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json({ trackers: results.rows });
    }
  );
};

const getTrackerGeoJson = async (request, response) => {
  const trackerName = request.params.name;

  try {
    console.log("GET GEOJSON PARAMS : ", trackerName);
    const dbResult = await pool.query(
      `SELECT * FROM archive WHERE name=$1 order by id desc ;`,
      [trackerName]
    );

    const geojson = {
      type: "FeatureCollection",
      features: [],
    };

    dbResult.rows.forEach((event) => {
      const feature = {
        type: "Feature",
        properties: {
          name: event.name,
          lastSeen: event.date_time,
          lastSeenZ: event.date_time_z,
        },
        geometry: {
          type: "Point",
          coordinates: [event.longitude, event.latitude],
        },
      };
      geojson.features.push(feature);
    });

    response.status(200).json(geojson);
  } catch (error) {}
};

const addTracker = async (request, response) => {
  const { name, email } = request.body;

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
  const { id, name, latitude, longitude, dateTime } = request.body;
  let regions = [];
  const trackerId = id;

  try {
    await pool.query(`SELECT * FROM regions;`, (error, results) => {
      if (error) {
        throw error;
      }
      regions = results.rows;

      const pointToCheck = point([longitude, latitude]);
      let regionId;
      let regionName;
      let isPointInPoly = false;

      regions.every((region) => {
        const polyStringArray = region.polygon.split(";");
        let polyArray = [];
        polyStringArray.forEach((item) =>
          polyArray.push(item.split(",").map((coord) => parseFloat(coord)))
        );
        const polygonToCheck = polygon([polyArray]);
        isPointInPoly = booleanPointInPolygon(pointToCheck, polygonToCheck);

        if (isPointInPoly) {
          regionId = region.id;
          regionName = region.name;
          console.log("POINT IN POLY : ", region.name, regionId);
          return false;
        }
        return true;
      });
      pool.query(
        `SELECT t.region_id, t.email, r.name AS "regionName" FROM tracker t LEFT OUTER JOIN regions r ON t.region_id = r.id WHERE t.id = $1;`,
        [trackerId],
        (error, results) => {
          const currentRegionId = results.rows[0].region_id;
          const currentRegionName = results.rows[0].regionName;
          const email = results.rows[0].email;

          if ((currentRegionId || regionId) && regionId !== currentRegionId) {
            const status = regionId ? "Enter" : "Leave";
            const emailRegionName =
              status === "Enter" ? regionName : currentRegionName;
            const emailContent = `Tracker : ${name}, Region : ${emailRegionName}, Status: ${status}`;
            sendEmail(emailContent, email);
          }

          pool.query(
            `UPDATE tracker SET latitude=$1, longitude=$2, region_id=$3, date_time=$4 WHERE name IN ($5) RETURNING *;`,
            [latitude, longitude, regionId, dateTime, name],
            (error, results) => {
              response.status(200).json(results.rows[0]);
            }
          );

          pool.query(
            `INSERT INTO public.archive ("name", latitude, longitude, date_time, date_time_z)
            VALUES($1, $2, $3, $4, $5)`,
            [name, latitude, longitude, dateTime, dateTime]
          );
        }
      );
    });
  } catch (error) {
    if (error) {
      response.status(400).json(error);
      throw error;
    }
  }
};

const deleteTracker = (request, response) => {
  const trackerId = request.params.id;

  try {
    pool.query(
      `DELETE FROM tracker WHERE id=$1;`,
      [trackerId],
      (error, results) => {
        if (error) {
          response.status(400).json(error);
          throw error;
        } else {
          response.status(200).json();
        }
      }
    );
  } catch (error) {}
  response.status(200).json({});
};

const validateTracker = (request, response) => {
  let trackerName = request.params.name;

  pool.query(
    `SELECT t.id, t.name FROM tracker t WHERE t.name=$1`,
    [trackerName],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows.length) {
        const res = {
          tracker: results.rows[0],
          message: "Valid tracker",
        };
        response.status(200).json(results.rows[0]);
      } else {
        const errorResponse = {
          error: "Not found",
          code: 404,
          message: "Tracker not found",
        };
        response.status(404).json(errorResponse);
      }
    }
  );
};

module.exports = {
  getTrackers,
  addTracker,
  setTracker,
  getTrackerGeoJson,
  deleteTracker,
  validateTracker,
};
