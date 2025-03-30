#!/bin/bash
# Expose environment variables to the application
export $(grep -v '^#' /app/.env | xargs)
exec /app/dist/iris_cua