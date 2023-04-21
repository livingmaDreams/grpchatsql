const express = require('express');
const router = express.Router();
const signUpController = require('../controllers/signup');

router.get('/',signUpController.getSignUpPage);
router.post('/',signUpController.postSignUp);

module.exports = router;