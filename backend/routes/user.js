const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const rateLimit = require('express-rate-limit');
const userValidation = require("../middleware/user-validation");

const apiLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 10,
	standardHeaders: true, 
	legacyHeaders: false, 
})

router.post('/signup', apiLimiter, userValidation, userCtrl.signup)
router.post('/login', apiLimiter, userCtrl.login)

module.exports = router;
