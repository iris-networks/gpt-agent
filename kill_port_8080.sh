#!/bin/bash

# Find process using port 8080
PID=$(lsof -t -i:8080)

if [ -z "$PID" ]; then
  echo "No process is running on port 8080"
  exit 0
else
  echo "Killing process $PID running on port 8080"
  kill -9 $PID
  echo "Process terminated"
fi