# Melius Operarius Verification Instructions

This document outlines how to verify that Melius Operarius is properly set up and functional.

## Pre-requisites

1. **Node.js 16+** installed on your system
2. **Ollama** installed and running (download from https://ollama.ai)
3. An available port (default: 3000)

## Step-by-Step Verification

### 1. Clone and Install Dependencies
```bash
git clone https://github.com/appointeasedev-oss/melius-operarius.git
cd melius-operarius
npm install
```

### 2. Verify Core Components
The application should successfully import all core modules:

```javascript
// This should execute without errors
const Controller = require('./src/controller');
const ConfigManager = require('./src/config-manager');
const ModelManager = require('./src/model-manager');
const PluginManager = require('./src/plugin-manager');
const ToolManager = require('./src/tool-manager');
const MonitoringService = require('./src/monitoring');

console.log("✓ All core modules imported successfully");
```

### 3. Run Setup Wizard
```bash
npx melius-operarius setup-wizard
```

Follow the prompts to configure your system. The setup should complete without errors.

### 4. Start the Service
```bash
npm start
```

The service should start and show output similar to:
```
Starting Melius Operarius service...
Initializing Melius Operarius Controller...
✓ Connected to Ollama server
✓ Plugins loaded successfully
✓ Tool manager initialized
🚀 Melius Operarius server running on http://localhost:3000
📋 API documentation available at http://localhost:3000/api/docs
🔧 Models endpoint: http://localhost:3000/models
💬 Chat endpoint: http://localhost:3000/chat
```

### 5. Test API Endpoints

While the service is running, test these endpoints in another terminal:

```bash
# Health check
curl http://localhost:3000/health

# System info
curl http://localhost:3000/system

# List models
curl http://localhost:3000/models

# Get metrics
curl http://localhost:3000/metrics
```

### 6. Test Web Interface
Open your browser to `http://localhost:3000/web` and verify:
- The dashboard loads properly
- System status indicators show correctly
- Chat interface is responsive

### 7. Test CLI Commands
```bash
# List models
npx melius-operarius models

# Start interactive chat
npx melius-operarius chat
```

### 8. Comprehensive Test Script
Run the included test script:
```bash
npm run test:quick
```

## Expected Outcomes

When properly configured, Melius Operarius should:

1. ✅ Start without errors
2. ✅ Connect to Ollama service
3. ✅ Load all core modules
4. ✅ Serve web interface at http://localhost:3000/web
5. ✅ Respond to API requests
6. ✅ Handle chat requests with Ollama models
7. ✅ Execute tools and plugins
8. ✅ Provide monitoring and metrics

## Troubleshooting

### Common Issues:

**"Configstore is not a constructor" error**
- This has been fixed by using a custom ConfigManager

**"chalk.blue is not a function" error**
- This has been resolved with proper fallback handling

**Cannot connect to Ollama**
- Verify Ollama is installed and running
- Check that Ollama is accessible at http://localhost:11434
- Run `ollama serve` to start the Ollama service

**Port already in use**
- Change the port during setup wizard
- Or modify the config file directly

## Advanced Testing

### Test Plugin System
```bash
# Check available plugins
curl http://localhost:3000/plugins

# Execute a plugin method (example)
curl -X POST http://localhost:3000/plugins/web-search/execute \
  -H "Content-Type: application/json" \
  -d '{"method": "search", "params": {"query": "test"}}'
```

### Test Tool System
```bash
# Check available tools
curl http://localhost:3000/tools

# Execute a tool (example)
curl -X POST http://localhost:3000/tools/datetime/execute
```

### Performance Testing
```bash
# Get performance metrics
curl http://localhost:3000/metrics/performance

# Get detailed metrics
curl http://localhost:3000/metrics
```

## Verification Checklist

- [ ] Node.js modules import correctly
- [ ] Configuration system works
- [ ] Service starts without errors
- [ ] Web interface loads
- [ ] API endpoints respond
- [ ] Ollama connection established
- [ ] Chat functionality works
- [ ] Plugins load successfully
- [ ] Tools execute properly
- [ ] Monitoring system operational

## Success Criteria

The system is fully operational when:
1. All CLI commands execute without errors
2. Web interface is fully functional
3. API endpoints return expected responses
4. Chat with Ollama models works properly
5. All monitoring and metrics are available
6. Plugin and tool systems are responsive
7. Configuration persists between restarts

## Next Steps

Once verified:
1. Customize your configuration
2. Install additional Ollama models
3. Explore advanced plugin development
4. Set up monitoring alerts
5. Deploy to production environment