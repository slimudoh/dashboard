

const express = require('express');
const homeController = require('../controllers/homeController');
const searchController = require('../controllers/searchController');

const router = express.Router();

router.get("/", homeController.home);
router.get("/:page", homeController.home);
router.post("/search", searchController.search);
router.post("/search/:page", searchController.search);


module.exports = router;
