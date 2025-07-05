const express = require('express')
const router = express.Router()
const connection = require('../Config/db');
const { read, list, create, update, remove ,GetPhoneList} = require('../Controllers/usersController')
//midleware
const {auth} = require('../Middleware/auth')
const {upload} =require('../Middleware/upload')

router.get('/GetAdminList',auth,list)
router.post('/GetAdminDetails',auth,read)
router.post('/CreateAdmin',auth,upload('profile_photo'),create)
router.post('/UpdateAdmin',auth,upload('profile_photo'),update)
router.post('/DeleteAdmin',auth,remove)
router.post('/GetPhoneList',auth,GetPhoneList)



module.exports = router

