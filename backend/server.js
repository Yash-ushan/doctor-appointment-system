const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIO = require('socket.io');

require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const hospitalRoutes = require('./routes/hospitals');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(limiter);
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room for private messaging
  socket.on('join_room', (data) => {
    socket.join(data.room);
    console.log(`User ${socket.id} joined room ${data.room}`);
  });

  // Handle chat messages
  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data);
  });

  // Handle appointment updates
  socket.on('appointment_update', (data) => {
    io.emit('appointment_notification', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Doctor Appointment System API is running',
    timestamp: new Date().toISOString()
  });
});

// Diagnostic endpoint for payment status issues
app.get('/api/diagnostic/payment-status', async (req, res) => {
  try {
    const Appointment = require('./models/Appointment');
    const Payment = require('./models/Payment');
    
    // Count pending payment appointments
    const pendingCount = await Appointment.countDocuments({ status: 'pending_payment' });
    const confirmedCount = await Appointment.countDocuments({ status: 'confirmed' });
    const totalPayments = await Payment.countDocuments({});
    const completedPayments = await Payment.countDocuments({ paymentStatus: 'completed' });
    
    // Get some sample pending appointments
    const samplePending = await Appointment.find({ status: 'pending_payment' })
      .populate('patientId', 'name email')
      .limit(5)
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: {
        appointments: {
          pending_payment: pendingCount,
          confirmed: confirmedCount,
          total: pendingCount + confirmedCount
        },
        payments: {
          completed: completedPayments,
          total: totalPayments
        },
        samplePendingAppointments: samplePending.map(apt => ({
          id: apt._id,
          patientName: apt.patientId?.name || 'Unknown',
          patientEmail: apt.patientId?.email || 'Unknown',
          appointmentDate: apt.appointmentDate,
          fee: apt.consultationFee,
          createdAt: apt.createdAt
        })),
        recommendations: pendingCount > 0 ? [
          'Run the payment fix utility',
          'Check PayHere webhook configuration',
          'Verify payment notification endpoint is accessible'
        ] : ['All appointments appear to have correct payment status']
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Diagnostic failed',
      error: error.message
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});