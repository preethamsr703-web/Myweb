const express = require('express');
const router = express.Router();
const { searchOpenLibrary, searchGoogleBooks } = require('../controllers/externalApiController');

router.get('/openlibrary', searchOpenLibrary);
router.get('/googlebooks', searchGoogleBooks);

module.exports = router;
