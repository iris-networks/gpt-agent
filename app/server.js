const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = '0.0.0.0';
const port = 3000;

// Create a simple HTML page
const indexHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Node.js Test Page</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 5px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
    }
    .info {
      background-color: #e9f7fe;
      border-left: 4px solid #2196F3;
      padding: 12px;
      margin: 15px 0;
    }
    .success {
      background-color: #e7f7e7;
      border-left: 4px solid #4CAF50;
      padding: 12px;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Node.js Server is Running</h1>
    <div class="success">
      <p><strong>Status:</strong> ✅ Server is active and running under the nodeuser account</p>
    </div>
    <div class="info">
      <p><strong>Server Information:</strong></p>
      <ul>
        <li>Node.js Version: ${process.version}</li>
        <li>Platform: ${process.platform}</li>
        <li>Process ID: ${process.pid}</li>
        <li>Server Started: ${new Date().toLocaleString()}</li>
      </ul>
    </div>
    <p>This server is running securely with proper user isolation from the VNC user.</p>
  </div>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(indexHtml);
});

server.listen(port, hostname, () => {
  console.log(`Server started at http://${hostname}:${port}/`);
  console.log(`Running as user: ${process.getuid()} / ${process.getgid()}`);
  console.log(`Node.js version: ${process.version}`);
});

// Keep the server running indefinitely and log status
setInterval(() => {
  console.log(`[${new Date().toISOString()}] Node.js server is active. PID: ${process.pid}`);
}, 60000);