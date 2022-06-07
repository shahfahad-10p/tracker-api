const { pool } = require("../../queries");

const getRegions = (request, response) => {
  pool.query(
    `SELECT r.*, COUNT(t.region_id) AS trackerCount 
    FROM regions r 
    LEFT OUTER JOIN tracker t 
    ON r.id = t.region_id 
    GROUP BY r.id;`,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json({ regions: results.rows });
    }
  );
};

const addRegion = (request, response) => {
  const { name, polygon } = request.body;
  console.log("ON INSERT REGION REQUEST : ", name, polygon);
  pool.query(
    `INSERT INTO public.regions ("name", polygon) 
    VALUES ($1, $2) RETURNING *`,
    [name, polygon],
    (error, results) => {
      console.log("ON INSERT TRACKER SUCCESS : ", results.rows[0]);
      response.status(200).json(results.rows[0]);
    }
  );
};

module.exports = {
  getRegions,
  addRegion,
};