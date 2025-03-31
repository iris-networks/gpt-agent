#!/bin/bash
# Expose environment variables to the application
export $(grep -v '^#' /app/.env.docker | xargs)
exec /app/dist/iris_cua