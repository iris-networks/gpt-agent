# Iris API Reference

<!-- SPDX-License-Identifier: UNLICENSED -->
<!-- Copyright: Proprietary -->

This document provides reference information for the Iris API endpoints.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Authentication is not implemented in this version. It should be added for production use.

## Endpoints

### Sessions

#### Create a new session

```
POST /sessions
```

Creates a new automation session.

**Request Body:**

```json
{
  "instructions": "Open Chrome and navigate to example.com",
  "operator": "browser",  // Optional: "browser" or "computer"
  "config": {             // Optional: override default config
    "vlmBaseUrl": "https://api.example.com",
    "vlmApiKey": "your-api-key",
    "vlmModelName": "default-model",
    "vlmProvider": "ui_tars_1_5",
    "language": "en",
    "maxLoopCount": 10,
    "loopIntervalInMs": 1000
  }
}
```

**Response:**

```json
{
  "sessionId": "1682179454321"
}
```

**Status Codes:**
- `201 Created`: Session created successfully
- `400 Bad Request`: Invalid request
- `500 Internal Server Error`: Server error

---

#### Get session status

```
GET /sessions/:sessionId
```

Gets the status and conversations for a specific session.

**Response:**

```json
{
  "sessionId": "1682179454321",
  "status": "running",
  "operator": "browser",
  "conversations": [
    {
      "role": "assistant",
      "content": "I'll open Chrome and navigate to example.com"
    },
    {
      "role": "assistant",
      "content": "I've opened Chrome. Now navigating to example.com"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Request successful
- `404 Not Found`: Session not found
- `500 Internal Server Error`: Server error

---

#### Cancel a session

```
POST /sessions/:sessionId/cancel
```

Cancels an active session.

**Response:**

```json
{
  "success": true
}
```

**Status Codes:**
- `200 OK`: Request successful
- `404 Not Found`: Session not found
- `500 Internal Server Error`: Server error

---

#### Get a screenshot

```
GET /sessions/:sessionId/screenshot
```

Gets a screenshot of the current session.

**Response:**

```json
{
  "success": true,
  "screenshot": "base64-encoded-image"
}
```

**Status Codes:**
- `200 OK`: Request successful
- `404 Not Found`: Session not found
- `500 Internal Server Error`: Server error

---

### Configuration

#### Get current configuration

```
GET /config
```

Gets the current system configuration.

**Response:**

```json
{
  "vlmBaseUrl": "https://api.example.com",
  "vlmApiKey": "******",
  "vlmModelName": "default-model",
  "vlmProvider": "ui_tars_1_5",
  "language": "en",
  "defaultOperator": "browser",
  "maxLoopCount": 10,
  "loopIntervalInMs": 1000
}
```

**Status Codes:**
- `200 OK`: Request successful
- `500 Internal Server Error`: Server error

---

#### Update configuration

```
PUT /config
```

Updates the system configuration.

**Request Body:**

```json
{
  "config": {
    "vlmBaseUrl": "https://new-api.example.com",
    "vlmApiKey": "new-api-key",
    "vlmModelName": "new-model",
    "defaultOperator": "computer"
  }
}
```

**Response:**

```json
{
  "vlmBaseUrl": "https://new-api.example.com",
  "vlmApiKey": "******",
  "vlmModelName": "new-model",
  "vlmProvider": "ui_tars_1_5",
  "language": "en",
  "defaultOperator": "computer",
  "maxLoopCount": 10,
  "loopIntervalInMs": 1000
}
```

**Status Codes:**
- `200 OK`: Request successful
- `400 Bad Request`: Invalid request
- `500 Internal Server Error`: Server error