require("dotenv").config();
const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");

require("./config/connectDb")();

const PORT = process.env.PORT;

const app = express();
const httpServer = http.createServer(app);
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(
  morgan(
    (tokens, req, res) => {
      return [
        tokens.date(req, res, "clf"),
        tokens["remote-addr"](req, res),
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens.res(req, res, "response-time"),
        "ms",
        JSON.stringify(req.headers),
        JSON.stringify(req.body),
        JSON.stringify(res.locals),
      ].join(" ");
    },
    { stream: accessLogStream }
  )
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "media")));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    origin: "https://aff.safka-eg.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// auth routes
app.use("/api", require("./routes/authRoutes"));

// dashboard apis
app.use("/api", require("./routes/notificationRoutes"));
app.use("/api", require("./routes/dashboardRoutes"));

app.use("/api", require("./routes/ruleRoutes"));
app.use("/api", require("./routes/categoryRoutes"));
app.use("/api", require("./routes/shippingCompanyRoutes"));
app.use("/api", require("./routes/priceListRoutes"));

app.use("/api", require("./routes/userRoutes"));
app.use("/api", require("./routes/moderatorRoutes"));
app.use("/api", require("./routes/warehouseRoutes"));
app.use("/api", require("./routes/productRoutes"));
app.use("/api", require("./routes/orderRoutes"));
app.use("/api", require("./routes/requestRoutes"));
app.use("/api", require("./routes/supportRoutes"));

app.use("/api", require("./routes/accountRoutes"));

// this will work in the production mode
if (process.env.NODE_ENV === "production") {
  app.use(express.static("../affiliate-client/build"));
  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "..", "affiliate-client", "build", "index.html")
    );
  });
}

httpServer.listen(PORT, (_) => console.log(`APP RUNNING AT PORT ${PORT}`));
