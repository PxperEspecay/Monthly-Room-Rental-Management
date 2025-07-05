const express = require('express')
const router = express.Router()
const {ListCommu, CreateCommu, DetailsCommu, UpdateCommu, GetMasterLocation} = require('../Controllers/communities_controller')
const {auth} = require('../Middleware/auth')
const {upload} =require('../Middleware/upload')
const {upload_img_commu} = require('../Middleware/upload')

router.get('/GetCommuList',auth, ListCommu)
router.post('/CreateNewCommunity',auth,upload_img_commu(), CreateCommu)
router.post('/GetCommuDetails',auth, DetailsCommu)
router.post('/UpdateCommunity',auth,upload_img_commu(), UpdateCommu)
router.get('/GetMasterLocation',auth, GetMasterLocation)


module.exports = router