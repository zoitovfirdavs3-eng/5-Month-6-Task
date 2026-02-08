require("dotenv").config();
const express = require("express");
const dbConnection = require("./lib/db.service");
const mainRouter = require("./router/main.routes");
const cookieParser = require("cookie-parser");

dbConnection().catch(() => process.exit(1));

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api", mainRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on ${PORT}-port`));