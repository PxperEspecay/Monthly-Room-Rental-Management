const express = require('express')
const router = express.Router()
const {auth} = require('../Middleware/auth')
const {GetDashboardData} = require('../Controllers/dashboard_controller')


router.post('/GetDashboardData',auth,GetDashboardData);


module.exports = router