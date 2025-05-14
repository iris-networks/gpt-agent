# Deploying Minio Object Storage on Fly.io

This document explains how to deploy the Minio S3-compatible storage service alongside Iris on Fly.io.

## Overview

Minio is an S3-compatible object storage solution that can be used to store and retrieve files, including video uploads, images, and other media. This guide covers:

1. Local development setup with Docker Compose
2. Deploying to Fly.io
3. Configuration and usage

## Local Development Setup

The project includes a Docker Compose configuration for local development that includes both the Iris application and Minio server.

### Prerequisites

- Docker and Docker Compose installed
- Git repository cloned locally

### Running Locally

1. Start the services with Docker Compose:

```bash
docker-compose up
```

2. Access the services:
   - Iris application: http://localhost:3000
   - Minio API: http://localhost:9000
   - Minio Console: http://localhost:9001

### Default Credentials

The default Minio credentials are:
- Access Key: `minioadmin`
- Secret Key: `minioadmin`

## Deploying to Fly.io

### Prerequisites

- Fly CLI installed (`flyctl`)
- Logged in to Fly.io (`flyctl auth login`)

### Creating a Persistent Volume

Before deploying, create a persistent volume to store Minio data:

```bash
flyctl volumes create iris_minio_data --region sin --size 10
```

### Deployment

Deploy the application and Minio service to Fly.io:

```bash
flyctl deploy
```

The deployment uses the configuration in `fly.toml`, which includes:
- The Iris application
- Minio service on ports 9000 (API) and 9001 (Console)
- Persistent volume mounting

### Environment Variables

The following environment variables are used for Minio configuration:

```
MINIO_ENDPOINT=<flyio-app-name>.fly.dev
MINIO_PORT=9000
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_REGION=us-east-1
MINIO_BUCKET=uploads
```

You should set secure credentials in the Fly.io secrets:

```bash
flyctl secrets set MINIO_ACCESS_KEY=your_secure_access_key MINIO_SECRET_KEY=your_secure_secret_key
```

## Creating Buckets

The application will automatically create the required buckets if they don't exist. However, you can also create them manually:

### Using the Minio Console

1. Access the Minio Console at https://your-app-name.fly.dev:9001
2. Log in with your access key and secret key
3. Create a new bucket named "uploads"

### Using the Minio Client

1. Install the Minio Client (`mc`)
2. Configure the client:
   ```bash
   mc alias set iris-minio https://your-app-name.fly.dev:9000 your_access_key your_secret_key
   ```
3. Create the bucket:
   ```bash
   mc mb iris-minio/uploads
   ```

## Security Considerations

For production environments:

1. Use strong, unique credentials for Minio
2. Configure bucket policies to restrict access
3. Enable encryption for sensitive data
4. Consider implementing IAM policies for more granular access control

## Troubleshooting

### Connection Issues

If you can't connect to Minio, check:

1. The Fly.io firewall rules are correctly configured
2. The application is running (`flyctl status`)
3. The environment variables are correctly set

### Volume Issues

If data isn't persisting:

1. Check that the volume is correctly mounted (`flyctl volumes list`)
2. Verify the path in the `fly.toml` configuration

### Logs

Check the logs for issues:

```bash
flyctl logs
```

## References

- [Minio Documentation](https://docs.min.io/)
- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io Volumes](https://fly.io/docs/volumes/)