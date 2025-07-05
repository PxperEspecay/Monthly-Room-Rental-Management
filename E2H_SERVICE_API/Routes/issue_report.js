const express = require('express')
const router = express.Router()
const {CreateIssue,GetListIssueForRenter,GetListIssueForAdmin,GetIssueDetails,UpdateIssueStatus,CancelThisIssue,GetHistoryIssueForRenter,EditIssue} = require('../Controllers/issue_report_controller')
const {auth} = require('../Middleware/auth')
const {upload_img_issue} = require('../Middleware/upload')


router.post('/CreateIssue',auth,upload_img_issue(), CreateIssue);
router.post('/GetListIssueForRenter',auth,GetListIssueForRenter);
router.post('/GetListIssueForAdmin',auth,GetListIssueForAdmin);
router.post('/GetIssueDetails',auth,GetIssueDetails);
router.post('/UpdateIssueStatus',auth,UpdateIssueStatus);
router.post('/CancelThisIssue',auth,CancelThisIssue);
router.post('/GetHistoryIssueForRenter',auth,GetHistoryIssueForRenter);
router.post('/EditIssue',auth,upload_img_issue(),EditIssue);













module.exports = router