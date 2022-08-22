const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { AuthMiddleware } = require("../middleware/JWT")

router.get("/get-token", AuthMiddleware, userController.getToken)
router.get("/search", AuthMiddleware, userController.search)
router.get("/refresh", AuthMiddleware, userController.refresh)
router.post("/send-otp", userController.checkMailRegister, userController.sendOtp)
router.post("/sendTotp", userController.isCheckExistUser, userController.sendTotp)
router.post("/login", userController.isCheckExistUser, userController.comparePass, userController.verifyTotp);
router.post("/resgister", userController.checkSendTotp, userController.checkMailRegister, userController.checkTotpRegister, userController.createUser);

module.exports = router;
