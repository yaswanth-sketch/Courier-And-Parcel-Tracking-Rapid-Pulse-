const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Parcel = require('./models/Parcel');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB for Live Tracking Simulation'))
  .catch(err => console.error('MongoDB connection error:', err));

// Simulation: Update "Out for Delivery" parcels every 5 seconds
const simulateLiveTracking = async () => {
  try {
    const outForDeliveryParcels = await Parcel.find({ status: { $in: ['Out for Delivery', 'In Transit'] } });
    
    const agents = [
      { name: 'Rahul Sharma', phone: '+91 98765 43210' },
      { name: 'Priya Patel', phone: '+91 91234 56789' },
      { name: 'Amit Verma', phone: '+91 88888 77777' },
      { name: 'Sneha Reddy', phone: '+91 77777 66666' }
    ];

    for (let parcel of outForDeliveryParcels) {
      if (parcel.deliveryAgent.name === 'Assigning...') {
        const agent = agents[Math.floor(Math.random() * agents.length)];
        parcel.deliveryAgent.name = agent.name;
        parcel.deliveryAgent.phone = agent.phone;
      }
      
      // Randomly move the agent slightly
      const latDelta = (Math.random() - 0.5) * 0.001;
      const lngDelta = (Math.random() - 0.5) * 0.001;
      
      parcel.deliveryAgent.currentLocation.lat += latDelta;
      parcel.deliveryAgent.currentLocation.lng += lngDelta;
      parcel.deliveryAgent.lastUpdated = new Date();
      
      await parcel.save();
      console.log(`Updated location for Parcel ${parcel.trackingId}: ${parcel.deliveryAgent.currentLocation.lat}, ${parcel.deliveryAgent.currentLocation.lng}`);
    }
  } catch (error) {
    console.error('Simulation error:', error);
  }
};

console.log('Starting Live Tracking Simulation...');
setInterval(simulateLiveTracking, 5000);
