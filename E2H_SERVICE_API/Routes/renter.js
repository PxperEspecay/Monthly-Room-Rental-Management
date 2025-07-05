const express = require('express')
const router = express.Router()

const {CreateRenter,GetRenterList,GetRenterDetails,DeleteRenter,UpdateRenterDetails,GetMasterRenterList,EditDetailRenter,GetHistoryRenterList,GetDetailContract} = require('../Controllers/renter_controller')
const {auth} = require('../Middleware/auth')
const {upload} =require('../Middleware/upload')


router.post('/CreateRenter',auth,upload('file_contract'), CreateRenter)

router.post('/GetRenterList',auth, GetRenterList)

router.post('/GetHistoryRenterList',auth, GetHistoryRenterList)

router.post('/GetRenterDetails',auth, GetRenterDetails)

router.post('/DeleteRenter',auth, DeleteRenter)

router.post('/UpdateRenterDetails',auth,upload('img_profile'), UpdateRenterDetails)

router.post('/GetMasterRenterList',auth, GetMasterRenterList)

router.post('/EditDetailRenter',auth,upload('file_contract') ,EditDetailRenter)

router.post('/GetDetailContract',auth, GetDetailContract)

















module.exports = router