const express = require('express')
const router = express.Router()
const {ListBuildingOfCommu, CreateBuilding, GetBuildingDetailsWithRooms, GetBuildingDetails, UpdateBuildingDetails,GetMasterBuildings} = require('../Controllers/building_controller')
const {auth} = require('../Middleware/auth')
const {upload} = require('../Middleware/upload')

router.post('/GetBuildingList',auth, ListBuildingOfCommu)

router.post('/CreateBuilding',auth,upload('img_building'), CreateBuilding)

router.post('/GetBuildingDetailsWithRooms',auth, GetBuildingDetailsWithRooms)

router.post('/GetBuildingDetails',auth, GetBuildingDetails)

router.post('/UpdateBuildingDetails',auth,upload('img_building'), UpdateBuildingDetails)

router.post('/GetMasterBuildings',auth,GetMasterBuildings)


module.exports = router