const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.NODE_PORT || 8080;

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the screenshots directory
app.use('/screenshots', express.static(screenshotsDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', user: process.env.USER });
});

// Screenshot endpoint
app.post('/screenshot', (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot-${timestamp}.png`;
    const filePath = path.join(screenshotsDir, filename);
    
    // Take screenshot using scrot
    execSync(`DISPLAY=:1 scrot -z "${filePath}"`);
    
    res.status(200).json({
      success: true,
      message: 'Screenshot captured successfully',
      filename: filename,
      url: `/screenshots/${filename}`
    });
  } catch (error) {
    console.error('Error taking screenshot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture screenshot',
      error: error.message
    });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Node.js server running on port ${PORT}`);
  console.log(`Running as user: ${execSync('whoami').toString().trim()}`);
  console.log(`Display: ${process.env.DISPLAY}`);
});