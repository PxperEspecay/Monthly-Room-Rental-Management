const express = require('express')
const router = express.Router()
const {auth} = require('../Middleware/auth')
const {GetNotification,ReadNotification} = require('../Controllers/notification_controller')

router.post('/GetNotification',auth,GetNotification)
router.post('/ReadNotification',auth,ReadNotification)

module.exports = router