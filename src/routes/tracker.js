const { pool } = require("../../queries");

const setTracker = (request, response) => {
  const { name, latitude, longitude } = request.body;
  pool.query(
    `INSERT INTO public.tracker ("name", latitude, longitude)
    VALUES($1, $2, $3)
    on conflict (name)
    do
      UPDATE set latitude=$2, longitude=$3;`,
    [name, latitude, longitude],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(request.body);
    }
  );
};

module.exports = {
  setTracker,
};
