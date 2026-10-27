const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 EventHub API Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`🌐 Port: ${PORT}`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`💓 Health: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('Shutting down EventHub server gracefully...');
      server.close(() => {
        console.log('Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
