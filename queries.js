const Pool = require("pg").Pool;

const isProduction = process.env.NODE_ENV === "production";

const connectionString = "postgresql://my:admin@localhost:5432/testdb";

// const pool = new Pool({
//   user: "my",
//   host: "localhost",
//   database: "testdb",
//   password: "admin",
//   port: 5432,
// });

let pool;

if (isProduction) {
  console.log('RUNNING FOR PRODCUTION');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  console.log('RUNNING FOR DEVELOPMENT');
  pool = new Pool({
    connectionString,
  });
}

// const pool = new Pool({
//     connectionString,
// });

const getUsers = (request, response) => {
  console.log('POOL : GET USERS');
  pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
    if (error) {
      console.log('ERROR : GET USERS', error);
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getUserById = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query("SELECT * FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const createUser = (request, response) => {
  const { name, email } = request.body;

  pool.query(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id",
    [name, email],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`User added with ID: ${results.rows[0].id}`);
    }
  );
};

const updateUser = (request, response) => {
  const id = parseInt(request.params.id);
  const { name, email } = request.body;

  pool.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3",
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`User modified with ID: ${id}`);
    }
  );
};

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`User deleted with ID: ${id}`);
  });
};

module.exports = {
  pool,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
