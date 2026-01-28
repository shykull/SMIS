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
app.use("/api/announce", announceRouter);
const visitorRouter = require('./routes/Visitor');
app.use("/api/visitor", visitorRouter);
const vehicleRouter = require('./routes/Vehicles');
app.use("/api/vehicle", vehicleRouter);

// Accounting module routes
const accountingSettingsRouter = require('./routes/AccountingSettings');
app.use("/api/accounting/settings", accountingSettingsRouter);
const buildingAccountRouter = require('./routes/BuildingAccount');
app.use("/api/accounting/building-account", buildingAccountRouter);
const transactionTypeRouter = require('./routes/TransactionType');
app.use("/api/accounting/transaction-type", transactionTypeRouter);
const transactionRouter = require('./routes/Transaction');
app.use("/api/accounting/transaction", transactionRouter);
const paymentRouter = require('./routes/Payment');
app.use("/api/accounting/payment", paymentRouter);

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