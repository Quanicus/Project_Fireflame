const terrainMatrix = require("./generateTerrain");
const controller = require("./controller");
const Router = require('express');
const router = Router();

//router.get("/character", controller.getCharacter);
router.get("/resource/terrainMatrix", (req, res) => {
    res.send(terrainMatrix);
});

module.exports = router;