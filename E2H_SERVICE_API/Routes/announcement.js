const express = require('express')
const router = express.Router()
const {auth} = require('../Middleware/auth')
const {upload,upload_multi_file} = require('../Middleware/upload')
const {CreateAnnouncement,GetAnnouncements,ReadAnnouncement,UpdateAnnouncement,DeleteAnnouncement,GetHistoryAnnouncements,GetAnnouncementDetails} = require('../Controllers/announcement_controller')

router.post('/CreateAnnouncement',auth,upload_multi_file(), CreateAnnouncement);
router.post('/GetAnnouncements',auth, GetAnnouncements);
router.post('/DeleteAnnouncement',auth, DeleteAnnouncement);

router.post('/UpdateAnnouncement',auth,upload_multi_file(), UpdateAnnouncement);
router.get('/GetHistoryAnnouncements',auth,GetHistoryAnnouncements);
router.post('/GetAnnouncementDetails',auth,GetAnnouncementDetails);

router.post('/ReadAnnouncement',auth, ReadAnnouncement);







module.exports = router