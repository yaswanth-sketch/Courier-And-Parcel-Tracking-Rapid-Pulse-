const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getNotifications, markNotificationsRead, createFeedback, getMyFeedback } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/notifications', getNotifications);
router.put('/notifications/read', markNotificationsRead);
router.post('/feedback', createFeedback);
router.get('/feedback', getMyFeedback);

module.exports = router;
