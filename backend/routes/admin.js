const express = require('express');
const router = express.Router();
const { createAdmin, getAdminManagementData, getAllFeedback, updateFeedback, getAllParcels, updateStatus, getAdminStats, getAllUsers } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.post('/create-admin', createAdmin);
router.get('/admins', getAdminManagementData);
router.get('/feedback', getAllFeedback);
router.put('/feedback/:id', updateFeedback);
router.get('/stats', getAdminStats);
router.get('/parcels', getAllParcels);
router.put('/update-status/:id', updateStatus);
router.get('/users', getAllUsers);
router.get('/carriers', require('../controllers/adminController').getAllCarriers);
router.put('/assign-carrier/:id', require('../controllers/adminController').assignCarrier);

module.exports = router;
