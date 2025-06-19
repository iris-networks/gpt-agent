/**
 * VNC Service for Docker Container
 * This module handles starting the VNC server and related services in Docker environment
 */

import { spawn, exec } from 'child_process';
import * as fs from 'fs';

/**
 * Check if running in a Docker container
 */
export function isRunningInContainer(): boolean {
  return fs.existsSync('/.dockerenv') || fs.existsSync('/run/.containerenv');
}

/**
 * Start VNC and X Window System services with proper permissions
 */
export function startVncServices(): void {
  if (!isRunningInContainer()) {
    console.log('Not running in a container, skipping VNC startup');
    return;
  }

  console.log('Starting VNC services in Docker container');

  // Start Xvfb with sudo for proper permissions
  const xvfb = spawn('sudo', ['/usr/bin/Xvfb', ':1', '-screen', '0',
    `${process.env.VNC_RESOLUTION || '1280x800'}x${process.env.VNC_COL_DEPTH || '24'}`]);

  console.log('Started Xvfb on display :1');

  // Give Xvfb time to start
  setTimeout(() => {
    // Start XFCE session with sudo as vncuser for proper permissions
    const xfce = spawn('sudo', ['-u', 'vncuser', '/usr/bin/startxfce4'], {
      env: {
        ...process.env,
        DISPLAY: ':1',
        XDG_SESSION_TYPE: 'x11',
        XDG_CURRENT_DESKTOP: 'XFCE',
        HOME: process.env.VNC_HOME || '/home/vncuser',
        USER: 'vncuser'
      }
    });

    console.log('Started XFCE session');

    // VNC home directory from environment variable
    const vncHome = process.env.VNC_HOME || '/home/vncuser';

    // Start VNC server with sudo as vncuser
    const vncCommand = 'sudo /usr/bin/x11vnc -display :1 ' +
      `-autoport ${process.env.VNC_PORT || '5901'} ` +
      `-geometry ${process.env.VNC_RESOLUTION || '1280x800'} ` +
      `-forever -bg -rfbauth ${vncHome}/.vnc/passwd -xkb -noxrecord -noxfixes -noxdamage -shared -permitfiletransfer`;

    exec(vncCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting VNC server: ${error.message}`);
        return;
      }
      console.log('Started VNC server');

      // Start noVNC as regular user
      const novncCommand =
        `/opt/noVNC/utils/websockify/run --web=/opt/noVNC ${process.env.NOVNC_PORT || '6901'} ` +
        `localhost:${process.env.VNC_PORT || '5901'} &`;

      exec(novncCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error starting noVNC: ${error.message}`);
          return;
        }
        console.log('Started noVNC websockify');
        console.log('======================================================================');
        console.log(`VNC server started on port ${process.env.VNC_PORT || '5901'}`);
        console.log(`noVNC interface available at http://0.0.0.0:${process.env.NOVNC_PORT || '6901'}/vnc.html`);
        console.log('======================================================================');
      });
    });
  }, 2000);

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down VNC services');
    xvfb.kill();
  });

  process.on('SIGTERM', () => {
    console.log('Shutting down VNC services');
    xvfb.kill();
  });
}