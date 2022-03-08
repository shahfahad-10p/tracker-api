const { pool } = require("../../queries");

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
          coordinates: [event.latitude, event.longitude],
        },
      };
      geojson.features.push(feature);
    });

    console.log("GET GEOJSON : ", geojson);
    response.status(200).json(geojson);
  } catch (error) {}
};

const setTracker = async (request, response) => {
  const { name, latitude, longitude } = request.body;
  console.log("SET TRACKER : ", request.body);

  try {
    await pool.query(
      `INSERT INTO public.tracker ("name", latitude, longitude)
      VALUES($1, $2, $3)
      on conflict (name)
      do
        UPDATE set latitude=$2, longitude=$3;`,
      [name, latitude, longitude]
    );

    await pool.query(
      `INSERT INTO public.archive ("name", latitude, longitude)
      VALUES($1, $2, $3)`,
      [name, latitude, longitude]
    );
  } catch (error) {
    if (error) {
      response.status(400).json(error);
      throw error;
    }
  }
  response.status(200).json(request.body);
};

module.exports = {
  getTrackers,
  setTracker,
  getTrackerGeoJson,
};
