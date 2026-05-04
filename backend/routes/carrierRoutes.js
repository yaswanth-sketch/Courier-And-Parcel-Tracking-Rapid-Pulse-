const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getAssignedParcels, updateStatus, updateLocation } = require('../controllers/carrierController');

const carrierOnly = (req, res, next) => {
  if (req.user && req.user.role === 'carrier') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Carriers only' });
  }
};

router.get('/assigned', protect, carrierOnly, getAssignedParcels);
router.put('/update-status/:id', protect, carrierOnly, updateStatus);
router.post('/update-location', protect, carrierOnly, updateLocation);

module.exports = router;
