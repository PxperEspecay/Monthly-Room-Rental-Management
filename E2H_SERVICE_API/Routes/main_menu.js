const express = require('express')
const router = express.Router()
const {getMenu} = require('../Controllers/main_menu_controller')
const {auth} = require('../Middleware/auth')

router.get('/GetMainMenu',auth, getMenu)

module.exports = router