const express = require('express');
const { sendContactInquiry } = require('../controllers/contactController');

const router = express.Router();

router.post('/', sendContactInquiry);

module.exports = router;