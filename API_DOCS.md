# Melius Operarius API Documentation

## Overview
Melius Operarius provides a REST API for interacting with local Ollama models. The API is designed to be compatible with OpenClaw's interface while providing enhanced privacy and local processing capabilities.

## Base URL
`http://localhost:3000` (by default)

## Endpoints

### GET /health
**Description:** Health check endpoint
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-15T14:00:00.000Z",
  "uptime": 3600.5,
  "statistics": {
    "totalRequests": 150,
    "totalErrors": 2,
    "errorRate": 1.3,
    "avgResponseTime": 450.2
  },
  "system": {
    "heapUsedPercent": 45.2,
    "memoryUsage": {
      "rss": 12345678,
      "heapTotal": 87654321,
      "heapUsed": 45678901
    },
    "cpuUsage": {
      "percent": 15.2,
      "user": 1234567,
      "system": 234567
    }
  }
}
```

### POST /chat
**Description:** Send a chat message and receive a response from the AI model
**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "message": "Your message here",
  "history": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant", 
      "content": "Previous response"
    }
  ],
  "model": "llama3",
  "options": {
    "temperature": 0.7,
    "max_tokens": 2048
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": "AI response here...",
  "model": "llama3",
  "total_duration": 1234567890,
  "load_duration": 123456789
}
```

### GET /models
**Description:** List all available models
**Response:**
```json
{
  "models": [
    {
      "name": "llama3:latest",
      "model": "llama3:latest",
      "size": 4657032209,
      "digest": "abc123...",
      "modified_at": "2026-02-15T10:00:00.000Z",
      "details": {
        "format": "gguf",
        "family": "llama",
        "families": ["llama"],
        "parameter_size": "8B",
        "quantization_level": "Q4_0"
      }
    }
  ],
  "count": 1,
  "default": "llama3"
}
```

### POST /models/pull
**Description:** Pull a new model from Ollama registry
**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "model": "llama3"
}
```

**Response:**
```json
{
  "message": "Model llama3 pulled successfully",
  "success": true
}
```

### GET /config
**Description:** Get current configuration
**Response:**
```json
{
  "setupComplete": true,
  "ollamaHost": "http://localhost:11434",
  "defaultModel": "llama3",
  "serverPort": 3000
}
```

### POST /config
**Description:** Update configuration
**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "ollamaHost": "http://localhost:11434",
  "defaultModel": "mistral",
  "serverPort": 4000
}
```

**Response:**
```json
{
  "message": "Configuration updated",
  "config": {
    "ollamaHost": "http://localhost:11434",
    "defaultModel": "mistral", 
    "serverPort": 4000,
    "setupComplete": true
  }
}
```

### GET /system
**Description:** Get system information
**Response:**
```json
{
  "system": {
    "platform": "linux",
    "arch": "x64", 
    "nodeVersion": "v18.17.0",
    "uptime": 3600.5
  },
  "ollama": {
    "host": "http://localhost:11434",
    "modelsCount": 3,
    "defaultModel": "llama3"
  },
  "plugins": {},
  "health": {
    "status": "healthy",
    "timestamp": "2026-02-15T14:00:00.000Z",
    "uptime": 3600.5,
    "statistics": {
      "totalRequests": 150,
      "totalErrors": 2,
      "errorRate": 1.3,
      "avgResponseTime": 450.2
    }
  },
  "app": {
    "name": "Melius Operarius",
    "version": "0.1.0", 
    "setupComplete": true
  }
}
```

### GET /metrics
**Description:** Get detailed metrics in JSON or Prometheus format
**Headers:**
- `Accept: text/plain` for Prometheus format
- `Accept: application/json` for JSON format (default)

**Response (JSON):**
```json
{
  "summary": {
    "uptime": 3600000,
    "totalRequests": 150,
    "totalErrors": 2,
    "activeUsers": 5
  },
  "recent": {
    "requests": {
      "count": 50,
      "avgDuration": 450.2,
      "statusCodes": {
        "200": 48,
        "400": 2
      }
    },
    "errors": {
      "count": 2,
      "types": {
        "Error": 2
      }
    },
    "performance": {
      "count": 25,
      "avgDuration": 230.5
    }
  },
  "system": {
    "memory": {
      "rss": 12345678,
      "heapTotal": 87654321,
      "heapUsed": 45678901
    },
    "cpu": {
      "percent": 15.2,
      "user": 1234567,
      "system": 234567
    },
    "os": {
      "platform": "linux",
      "arch": "x64",
      "loadAverage": [1.2, 1.0, 0.8]
    }
  }
}
```

### GET /metrics/health
**Description:** Get health status metrics
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-15T14:00:00.000Z",
  "uptime": 3600.5,
  "statistics": {
    "totalRequests": 150,
    "totalErrors": 2,
    "errorRate": 1.3,
    "avgResponseTime": 450.2
  },
  "system": {
    "heapUsedPercent": 45.2,
    "memoryUsage": {
      "rss": 12345678,
      "heapTotal": 87654321,
      "heapUsed": 45678901
    },
    "cpuUsage": {
      "percent": 15.2,
      "user": 1234567,
      "system": 234567
    }
  }
}
```

### GET /metrics/performance
**Description:** Get performance metrics
**Response:**
```json
{
  "performance": {
    "count": 25,
    "avgDuration": 230.5
  },
  "system": {
    "memory": {
      "rss": 12345678,
      "heapTotal": 87654321,
      "heapUsed": 45678901
    },
    "cpu": {
      "percent": 15.2,
      "user": 1234567,
      "system": 234567
    }
  },
  "avgResponseTime": 450.2
}
```

## CLI Commands

### Start Service
```bash
npx melius-operarius start
```

### Setup
```bash
npx melius-operarius setup
```

### List Models
```bash
npx melius-operarius models
```

### Interactive Chat
```bash
npx melius-operarius chat
# Or with a specific model:
npx melius-operarius chat -m mistral
```

## Configuration

Melius Operarius stores its configuration using Configstore. The default values are:

- Server Port: 3000
- Ollama Host: http://localhost:11434
- Default Model: llama3

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad request (missing required fields)
- `404`: Resource not found
- `500`: Internal server error

Error responses include an `error` field with details about the issue.

## Security

- All processing happens locally on your machine
- No data is sent to external services
- The API runs on localhost by default
- Use appropriate firewall rules if exposing publicly