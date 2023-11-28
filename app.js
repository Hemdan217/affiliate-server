require("dotenv").config();
const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");
require("./config/connectDb")();

const PORT = process.env.PORT;

const app = express();
const httpServer = http.createServer(app);

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
if (true) {
  app.use(express.static("../affiliate-client/build"));
  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "..", "affiliate-client", "build", "index.html")
    );
  });
}

httpServer.listen(PORT, (_) => console.log(`APP RUNNING AT PORT ${PORT}`));
