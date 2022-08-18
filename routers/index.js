const userRoute = require("./user");
const albumRoute = require("./album");
const imageRoute = require("./image")
const serverRoute = require("./server")

function route(app) {
  app.use("/", serverRoute)
  app.use("/api/v1/image", imageRoute)
  app.use("/api/v1/album", albumRoute)
  app.use("/api/v1/users", userRoute);
}

module.exports = route;
