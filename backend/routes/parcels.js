const express = require('express');
const router = express.Router();
const { createParcel, trackParcel, getUserParcels, getDashboardStats, getIncomingParcels } = require('../controllers/parcelController');
const { protect, maybeProtect } = require('../middleware/auth');

router.post('/', protect, createParcel);
router.get('/my', protect, getUserParcels);
router.get('/incoming', protect, getIncomingParcels);
router.get('/dashboard', protect, getDashboardStats);
router.get('/:trackingId', maybeProtect, trackParcel);

module.exports = router;
