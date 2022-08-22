const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware")
const userController = require("../controllers/userController");
const { AuthMiddleware } = require("../middleware/JWT")

router.get("/image/users/:id/:id/:id", AuthMiddleware, userController.checkExistFile, userController.isOwner)
router.get("/image/users/:email/:album/:folder/:folder/:number/:filename", AuthMiddleware, userController.getImageOpenSeadragon)
module.exports = router;
