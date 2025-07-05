const express = require('express')
const router = express.Router()
const { login,check_username, set_password_mobile,login_mobile } = require('../Controllers/auth_controller')


// router.post('/register', register)

router.post('/login', login);
router.post('/login_mobile', login_mobile);
router.post('/check_username', check_username);
router.post('/set_password_mobile', set_password_mobile);



module.exports = router