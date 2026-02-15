# Melius Operarius

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node.js-%3E%3D16.0.0-green.svg)](https://nodejs.org/)
[![Ollama](https://img.shields.io/badge/ollama-required-blue.svg)](https://ollama.ai/)

An open-source AI agent that combines the functionality of OpenClaw with the privacy and independence of local Ollama models. Built with passion by Aras, designed for those who value privacy and local AI processing.

## 🚀 Vision

Melius Operarius aims to provide all the functionality of OpenClaw but using local Ollama models instead of external APIs. This ensures:

- **Complete privacy** - your data never leaves your machine
- **No API costs** - zero ongoing expenses after initial setup
- **Full control** - manage your own AI models
- **Offline capability** - works without internet connection
- **Same experience** - familiar interface as OpenClaw

## ✨ Features

- All core OpenClaw functionality in a local-first design
- Integrated Ollama model management and pulling
- Privacy-focused - no data leaves your device
- Command-line interface compatible with OpenClaw
- Extensible plugin system
- REST API for programmatic access
- Multiple deployment options (standalone, Docker, cloud)

## 🛠️ Prerequisites

- Node.js 16.x or higher
- Ollama installed and running ([Install Guide](https://ollama.ai/))
- At least 4GB free disk space for models

## 📦 Installation

### Option 1: Global Install (Recommended)

```bash
# Install globally (requires Node.js 16+)
npm install -g melius-operarius

# One-command setup and installation
install-melius
```

### Option 2: Run Without Installation

```bash
# Run directly with npx (no installation needed)
npx melius-operarius setup-wizard
```

### Option 3: From Source

```bash
# Clone the repository
git clone https://github.com/appointeasedev-oss/melius-operarius.git
cd melius-operarius

# Install dependencies
npm install

# Setup (ensure Ollama is running)
npx melius-operarius setup

# Start the service
npx melius-operarius start
```

### Option 4: Using Docker

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🚀 Usage

### CLI Commands

```bash
# Start the service
npx melius-operarius start

# Setup configuration
npx melius-operarius setup

# List available models
npx melius-operarius models

# Interactive chat
npx melius-operarius chat
npx melius-operarius chat -m mistral  # With specific model
```

### REST API

The service exposes a REST API at `http://localhost:3000` by default:

```bash
# Chat with the AI
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, world!",
    "model": "llama3"
  }'

# List available models
curl http://localhost:3000/models
```

## 🏗️ Architecture

Melius Operarius follows a modular architecture:

- **Controller Layer**: Orchestrates API requests and business logic
- **Model Manager**: Handles Ollama integration and model operations
- **Plugin System**: Extensible functionality through plugins
- **Configuration**: Persistent settings using Configstore
- **API Layer**: Express.js REST API

## 📊 Monitoring & Observability

Melius Operarius includes built-in monitoring and observability features:

- **Health Checks**: Real-time system health monitoring
- **Performance Metrics**: Response times, throughput, error rates
- **System Monitoring**: Memory, CPU, and resource utilization
- **Prometheus Integration**: Export metrics in Prometheus format
- **Request Tracking**: Detailed request/response logging

### Metrics Endpoints
- `/health` - Health status
- `/metrics` - Detailed metrics (JSON or Prometheus format)
- `/metrics/health` - Health-specific metrics
- `/metrics/performance` - Performance metrics

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/appointeasedev-oss/melius-operarius.git
cd melius-operarius

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## 📄 API Documentation

See the [API Documentation](API_DOCS.md) for detailed information about all available endpoints.

## 🗺️ Roadmap

Check our [Roadmap](ROADMAP.md) to see planned features and development timeline.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by OpenClaw's excellent architecture and design
- Powered by Ollama for local AI inference
- Built with Node.js and Express.js
- Open source community for continuous inspiration

---

Built with ❤️ by Aras | Part of the OpenClaw-inspired ecosystem