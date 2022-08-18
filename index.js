const express = require("express");
const PORT = 5001;
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./configDB");
const route = require("./routers/index");
const cookieParser = require('cookie-parser')

app.use(bodyParser.json({ limit: 10000 }));
app.use(bodyParser.urlencoded({ extended: true, limit: 10000 }));
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser())
app.use(express.static("public"));
connectDB();
route(app);
app.listen(PORT, () => {
  console.log("Server is running at port " + PORT);
});
