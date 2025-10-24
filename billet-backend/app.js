const  express = require('express');
const database = require('./src/config/database');
const authRouter = require('./src/routes/auth');
const adminRouter = require('./src/routes/admin');
const testrouter = require('./src/routes/test');
const authTestRouter = require('./src/routes/auth-test');
const { errorHandler } = require('./src/middleware/errorHandler');
const cors = require('cors');
const helmet = require('helmet');
const testGenerated = require('./src/routes/qrTest')
const ticketRoutes = require('./src/routes/tickets');

const eventRoutes = require('./src/routes/events');
const downloadRoutes = require('./src/routes/downloads');
const publicRoutes = require('./src/routes/public');
const sellerRoutes = require('./src/routes/seller');
const shareRoutes = require('./src/routes/share');
const qrRoutes = require('./src/routes/qr');
const EmailService = require('./src/services/emailService');


const app = express();
app.use(express.urlencoded({ extended: true}));
app.use(helmet());

// CORS configuration for Render deployment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : '*', // Allow any origin in development, specific in production
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        status: 200,
        message: 'Welcome to the server!'
    })
});

// Health check endpoint for production monitoring
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// test Router
// app.use('/api/test', testrouter);
// app.use('/api/auth-test', authTestRouter)
// app.use('/api/test', testGenerated);


// Real Router
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter);
app.use('/api/qr', qrRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/buyerRoutes', downloadRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/seller', sellerRoutes);


// email share service
EmailService.initializeTransporter();

// Error handler must be last
app.use(errorHandler);

module.exports = app;


