const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { AuthMiddleware } = require("../middleware/JWT")

router.post("/update-name-user", AuthMiddleware, userController.updateUserName)
router.get("/get-all-status-image", AuthMiddleware, userController.getAllStatusImage)
router.post("/update-avatar", AuthMiddleware, userController.updateAvatar)
router.post("/change-password", AuthMiddleware, userController.changePassword)
router.get("/get-token", AuthMiddleware, userController.getToken)
router.get("/search", AuthMiddleware, userController.search)
router.get("/refresh", AuthMiddleware, userController.refresh)
router.post("/send-otp", userController.checkMailRegister, userController.sendOtp)
router.post("/sendTotp", userController.isCheckExistUser, userController.sendTotp)
router.post("/login", userController.isCheckExistUser, userController.comparePass, userController.verifyTotp);
router.post("/resgister", userController.checkSendTotp, userController.checkMailRegister, userController.checkTotpRegister, userController.createUser);

module.exports = router;
