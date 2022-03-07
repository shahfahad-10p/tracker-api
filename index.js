const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const db = require("./queries.js");
const tracker = require("./src/routes/tracker");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const whitelist = [
  "http://localhost:3001",
  "http://localhost:3001",
  "https://tracker-m11.surge.sh",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.get("/", (request, response) => {
  try {
    response.json({ info: "Node.js, Express, and Postgres API" });
  } catch (e) {
    console.log("APP ERROR ", e);
  }
});

app.get("/users", db.getUsers);
app.get("/users/:id", db.getUserById);
app.post("/users", db.createUser);
app.put("/users/:id", db.updateUser);
app.delete("/users/:id", db.deleteUser);

app.get("/trackers", tracker.getTrackers);
app.put("/tracker", tracker.setTracker);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
