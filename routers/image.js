const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware")
const imageController = require("../controllers/imageController");
const { AuthMiddleware } = require("../middleware/JWT")

router.post("/move-image", AuthMiddleware, imageController.moveImage)
router.get("/clear-image-trash", imageController.clearTrash)
router.post("/check-upload1", AuthMiddleware, imageController.checkUpload1)
router.post("/unshare-image-with-me", AuthMiddleware, imageController.unshareImageWithMe)
router.post("/check-upload", AuthMiddleware, imageController.checkUpload)
router.delete("/delete-image", AuthMiddleware, imageController.deleteImage)
router.post("/unshare-image", AuthMiddleware, imageController.unshareImage)
router.post("/share-image", AuthMiddleware, imageController.shareImage)
router.get("/get-image", AuthMiddleware, imageController.getImage)
router.post("/upload1", AuthMiddleware, upload.array('file', 20), imageController.isValidateFile, imageController.isCheckFolder, imageController.saveFile1)
router.post("/upload", AuthMiddleware, upload.array('file', 20), imageController.isValidateFile, imageController.isCheckFolder, imageController.saveFile)

module.exports = router;
