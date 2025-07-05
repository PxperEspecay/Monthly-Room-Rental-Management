const express = require('express')
const router = express.Router()
const {auth} = require('../Middleware/auth')
const {GetRoomsListByBuildingId,AddRoomToBuilding,DeleteRoomFromBuilding,GetRoomDetails,UpdateRoomDetails,GetAvailableRooms,UpdateRoomStatus,GetRoomsListWithRenter,GetRenterByRoomID,GetUnavaliableRoomWithRenter,GetRoomById,GetLocationDetail} = require('../Controllers/rooms_controller')


router.post('/GetRoomsListByBuildingId',auth, GetRoomsListByBuildingId)

router.post('/AddRoomToBuilding',auth, AddRoomToBuilding)
router.post('/DeleteRoomFromBuilding',auth, DeleteRoomFromBuilding)
router.post('/GetRoomDetails',auth, GetRoomDetails)
router.post('/UpdateRoomDetails',auth, UpdateRoomDetails)
router.post('/GetAvailableRooms',auth, GetAvailableRooms)
router.post('/UpdateRoomStatus',auth, UpdateRoomStatus)
router.post('/GetRoomsListWithRenter',auth, GetRoomsListWithRenter)
router.post('/GetRenterByRoomID',auth, GetRenterByRoomID)
router.post('/GetUnavaliableRoomWithRenter',auth, GetUnavaliableRoomWithRenter)
router.post('/GetRoomById',auth, GetRoomById)
router.post('/GetLocationDetail',auth, GetLocationDetail)






module.exports = router