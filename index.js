const express = require("express");
const PORT = 5001;
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./configDb");
const connectRedis = require("./configRedis")
const route = require("./routers/index");
const cookieParser = require('cookie-parser')
var cluster = require('cluster');
var cpuCount = require('os').cpus().length;

app.use(bodyParser.json({ limit: 10000 }));
app.use(bodyParser.urlencoded({ extended: true, limit: 10000 }));
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser())
app.use(express.static("public"));
connectDB();
connectRedis()
route(app);

if (cluster.isMaster) {
  for (var i = 0; i < cpuCount; i++) {
    cluster.fork();
  }
  cluster.on('exit', function (worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });
} else {

  app.listen(PORT, () => {
    console.log("Server is running at port " + PORT);
  });
}


