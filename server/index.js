const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require("cors");

require('dotenv').config();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true, // Allow credentials (cookies)
}));

const db = require("./models");
// Routers
const usersRouter = require('./routes/Users');
app.use("/api/user", usersRouter);
const buildingRouter = require('./routes/Buildings');
app.use("/api/build", buildingRouter);
const announceRouter = require('./routes/Announce');
app.use("/api/build", announceRouter);

db.sequelize.sync()
  .then(() => {
    console.log("Database synchronized successfully.");
    app.listen(3001, () => {
      console.log("Server Running on port 3001");
    });
  })
  .catch((error) => {
    console.error("Error during synchronization:", error);
  });