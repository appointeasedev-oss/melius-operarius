<div align="center">
  <h1>🤖 Melius Operarius</h1>
  <p><strong>Advanced Local AI Agent</strong></p>
  <p>Enterprise-grade AI capabilities with complete privacy. All processing happens on your machine with no data leaving your control.</p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-v16%2B-green.svg)](https://nodejs.org/)
  [![Ollama](https://img.shields.io/badge/Ollama-Supported-blue.svg)](https://ollama.ai/)
  [![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](#)

  <a href="./website/index.html" target="_blank">
    <img src="https://img.shields.io/badge/Demo-Website-brightgreen?style=for-the-badge&logo=google-chrome" alt="Demo Website" />
  </a>
  <a href="#installation" target="_blank">
    <img src="https://img.shields.io/badge/Get_Started-Installation-orange?style=for-the-badge&logo=github" alt="Installation" />
  </a>
</div>

---

## 🌟 Why Choose Melius Operarius?

Melius Operarius represents the future of AI agents - one that prioritizes **privacy**, **performance**, and **user control**. Unlike cloud-dependent alternatives, this system provides:

- ✅ **100% Local Processing** - Your data never leaves your machine
- ✅ **Lightning Fast Performance** - No network latency, instant responses
- ✅ **Zero Recurring Costs** - One-time setup, yours forever
- ✅ **Complete Customization** - Fully extensible architecture
- ✅ **Enterprise-Grade Monitoring** - Comprehensive observability
- ✅ **Offline Functionality** - Works without internet connection
- ✅ **Advanced Tool Integration** - File system and system command access
- ✅ **Plugin Architecture** - Extend functionality as needed

## 🚀 Key Features

### 🔒 Privacy-First Architecture
- Complete local AI processing with Ollama models
- No external data transmission
- Full data sovereignty and control
- Zero cloud dependency

### ⚡ Superior Performance
- Lightning-fast response times
- Optimized for your local hardware
- No network bottlenecks
- Consistent availability

### 🧩 Extensible Design
- Plugin system for custom functionality
- Advanced tool management
- Modular architecture
- Easy integration capabilities

### 📊 Comprehensive Monitoring
- Real-time performance metrics
- Health status monitoring
- Prometheus-compatible metrics
- Detailed observability

### 🎯 Multiple Interfaces
- Beautiful web dashboard
- Powerful CLI interface
- RESTful API for automation
- Interactive chat capabilities

## 🛠️ Technical Capabilities

### Core Architecture
- **Local AI Processing**: Powered by Ollama models running on your hardware
- **Modular Design**: Plugin and tool architectures for extensibility  
- **Configuration Management**: Custom ConfigManager with persistent storage
- **API-First**: Comprehensive REST API for programmatic access

### Advanced Features
- **Web Interface**: Modern dashboard with real-time metrics
- **CLI Tools**: Full command-line interface for automation
- **Plugin System**: Dynamic loading and execution of custom plugins
- **Tool Management**: Integrated tools for file operations and system commands
- **Monitoring**: Built-in metrics, health checks, and performance tracking
- **Security**: Input validation, access controls, and secure operations

## 📦 Installation

### Prerequisites
- Node.js v16 or higher
- Ollama installed ([download from ollama.ai](https://ollama.ai))
- Available system resources (8GB RAM recommended)

### Quick Install
```bash
# Install globally
npm install -g melius-operarius

# Run setup wizard
npx melius-operarius setup-wizard

# Start the service
npm start
```

### Manual Installation
```bash
# Clone the repository
git clone https://github.com/appointeasedev-oss/melius-operarius.git
cd melius-operarius

# Install dependencies
npm install

# Run setup
npx melius-operarius setup

# Start the service
npm start
```

## 🚀 Getting Started

### 1. Web Interface
Visit `http://localhost:3000/web` for the dashboard interface

### 2. CLI Commands
```bash
# Start the service
melius-operarius start

# Interactive chat
melius-operarius chat

# List available models
melius-operarius models

# Run setup wizard
melius-operarius setup-wizard
```

### 3. API Usage
```bash
# Health check
curl http://localhost:3000/health

# Chat with AI
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "model": "llama3"}'

# List models
curl http://localhost:3000/models

# Get metrics
curl http://localhost:3000/metrics
```

## 🎨 Web Dashboard

The web interface provides:
- Real-time system monitoring
- Interactive chat interface
- Model management
- Plugin configuration
- Performance metrics
- System health status

Access at: `http://localhost:3000/web`

## 🔌 Plugin Architecture

Extend functionality with custom plugins:

```javascript
// Example plugin structure
class MyCustomPlugin {
  constructor() {
    this.name = 'my-plugin';
  }

  async initialize() {
    // Initialization logic
  }

  async myCustomMethod(params) {
    // Custom functionality
    return { result: 'success' };
  }

  getAvailableMethods() {
    return ['myCustomMethod'];
  }
}
```

## 🛠️ Tool Management

Built-in tools for system integration:
- File operations (read, write, list, info)
- System command execution
- Network utilities (ping, port scanning)
- Web content fetching
- Calculation and utility functions

## 📊 Monitoring & Observability

Comprehensive monitoring includes:
- Real-time performance metrics
- Health status with error rate calculation
- Resource utilization tracking
- Request/response analytics
- Prometheus-compatible metrics export

## 🐳 Deployment Options

### Docker
```bash
# Build Docker image
npm run build:docker

# Run container
docker run -p 3000:3000 melius-operarius:latest
```

### Kubernetes
```bash
# Deploy to Kubernetes
kubectl apply -f deploy/k8s-deployment.yaml
```

### Direct Node.js
```bash
# Run directly
npm start
```

## 📚 Documentation

For complete documentation, visit:
- [API Reference](./API_DOCS.md)
- [Development Guide](./DEVELOPMENT_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Guide](./TESTING.md)
- [Contributing](./CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on how to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

- [Issues](https://github.com/appointeasedev-oss/melius-operarius/issues)
- [Documentation](./docs/)
- [Community](https://github.com/appointeasedev-oss/melius-operarius/discussions)

---

<div align="center">
  <p><strong>Melius Operarius</strong> - The future of AI is local, private, and powerful.</p>
  <p>Built with ❤️ for privacy-conscious developers and organizations</p>
</div>