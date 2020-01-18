const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

mongoose
  .connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(() => console.log("DB connected."));

mongoose.connection.on("error", error =>
  console.log(`Database connection failed: ${error.message}`)
);

const postRoutes = require("./routes/post");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

// const myOwnMiddleware = (req, res, next) => {
//   console.log("Middleware Applied!!!");
//   next();
// };

app.get("/", (req, res) => {
  const filePath = "docs/apiDocs.json";
  fs.readFile(filePath, (err, data) => {
    if (err) {
      return res.status(400).json({ error: err });
    }
    const docs = JSON.parse(data);
    res.json(docs);
  });
});

app.use(morgan("dev"));
// app.use(myOwnMiddleware);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
app.use("/api", postRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use(function(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: "Unauthorized!" });
  }
});

const port = process.env.PORT || 8081;
app.listen(port, () =>
  console.log(`Node Server running & listening on port:::${port}`)
);
