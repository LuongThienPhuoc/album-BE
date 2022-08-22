const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware")
const userController = require("../controllers/userController");
const albumController = require("../controllers/albumController")
const { AuthMiddleware } = require("../middleware/JWT")


router.post("/unshare-album-with-me", AuthMiddleware, albumController.unshareAlbumWithMe)
router.post("/delete-album", AuthMiddleware, albumController.deleteAlbum);
router.post("/add-album", AuthMiddleware, albumController.addAlbum)
router.post("/unshare-album", AuthMiddleware, albumController.unshareAlbum)
router.post("/share-album", AuthMiddleware, albumController.shareAlbum)
router.get("/get-images-album", AuthMiddleware, albumController.getImagesInAlbum)

module.exports = router;
