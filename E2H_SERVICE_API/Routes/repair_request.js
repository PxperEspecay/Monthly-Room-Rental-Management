const express = require('express')
const router = express.Router()
const {auth} = require('../Middleware/auth')
const {upload_photo_issue_repair} = require('../Middleware/upload')
const {
    CreateRepairRequest,UpdateRepairRequestStatus,SelectDateTimeForRepair,
    UpdateRepairScheduledStatus,AdminRequestReschedule,RenterSelectNewDate,
    RenterRequestReschedule,GetRepairRequestsListForRenter,GetRepairRequestsListForAdmin,
    GetRepairRequestsDetails,EditRepairRequestDetails,GetHistoryRepairRequestsListForRenter
    } = require('../Controllers/repair_request_controller')


router.post('/CreateRepairRequest',auth,upload_photo_issue_repair(),CreateRepairRequest)
router.post('/EditRepairRequestDetails',auth,upload_photo_issue_repair(),EditRepairRequestDetails)
router.post('/UpdateRepairRequestStatus',auth,UpdateRepairRequestStatus)
router.post('/SelectDateTimeForRepair',auth,SelectDateTimeForRepair)
router.post('/UpdateRepairScheduledStatus',auth,UpdateRepairScheduledStatus)
router.post('/AdminRequestReschedule',auth,AdminRequestReschedule)
router.post('/RenterSelectNewDate',auth,RenterSelectNewDate)
router.post('/RenterRequestReschedule',auth,RenterRequestReschedule)
router.post('/GetRepairRequestsListForRenter',auth,GetRepairRequestsListForRenter)
router.post('/GetRepairRequestsListForAdmin',auth,GetRepairRequestsListForAdmin)
router.post('/GetRepairRequestsDetails',auth,GetRepairRequestsDetails)
router.post('/GetHistoryRepairRequestsListForRenter',auth,GetHistoryRepairRequestsListForRenter)



module.exports = router