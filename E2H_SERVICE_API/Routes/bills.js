const express = require('express')
const router = express.Router()
const {GetBillRentalByRenterID,GetHistoryBillByRenterID,GetBillListByCommunityID,UploadSlip,GetBillDetails,GetMasterBillType,CreateBill,DeleteBill,UpdateBill} = require('../Controllers/bills_controller')
const {auth} = require('../Middleware/auth')
const {upload} = require('../Middleware/upload')

router.post('/GetBillRentalByRenterID',auth, GetBillRentalByRenterID)
router.post('/GetHistoryBillByRenterID',auth, GetHistoryBillByRenterID)
router.post('/GetBillListByCommunityID',auth, GetBillListByCommunityID)
router.post('/UploadSlip',auth,upload('img_slip'), UploadSlip)
router.post('/GetBillDetails',auth, GetBillDetails)
router.post('/CreateBill',auth, CreateBill)
router.post('/DeleteBill',auth, DeleteBill)
router.post('/UpdateBill',auth, UpdateBill)
router.get('/GetMasterBillType',auth, GetMasterBillType)

module.exports = router