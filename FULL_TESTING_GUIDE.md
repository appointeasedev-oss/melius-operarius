# Comprehensive Testing Guide - Melius Operarius

This guide provides detailed instructions on how to test all features of Melius Operarius.

## Prerequisites

Before testing, ensure you have:

- Node.js 16+ installed
- Git installed
- Ollama installed (https://ollama.ai)
- At least 4GB free disk space
- Stable internet connection for initial setup

## Installation Test

### Test 1: Global Installation
```bash
# Install globally
npm install -g melius-operarius

# Run the one-command installer
install-melius

# Verify installation
which melius-operarius
melius-operarius --help
```

Expected: Commands should execute without errors, help text displayed.

### Test 2: Direct Execution (Without Installation)
```bash
# Clone repository
git clone https://github.com/appointeasedev-oss/melius-operarius.git
cd melius-operarius

# Install dependencies
npm install

# Run setup wizard
npx melius-operarius setup-wizard
```

Expected: Setup wizard starts and guides through installation process.

## Core Functionality Tests

### Test 3: Service Startup
```bash
# Start the service
melius-operarius start

# Or if running from source
npm start
```

Expected: Service starts without errors, shows "Melius Operarius server running on http://localhost:3000".

### Test 4: Health Check
Open a new terminal while service is running:
```bash
curl http://localhost:3000/health
```

Expected: JSON response with status "healthy" and system information.

### Test 5: Web Interface
1. Start the service
2. Open browser to `http://localhost:3000/web`
3. Verify all panels load
4. Check system status indicators
5. Test chat interface

Expected: Web interface loads completely with all functionality working.

## API Tests

### Test 6: System Information
```bash
curl http://localhost:3000/system
```

Expected: Detailed system information including models, plugins, and health status.

### Test 7: Models Endpoint
```bash
curl http://localhost:3000/models
```

Expected: List of available models (may be empty if no models are pulled yet).

### Test 8: Chat Functionality
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?", "model": "llama3"}'
```

Expected: AI-generated response to the message.

### Test 9: Plugin System
```bash
# List available plugins
curl http://localhost:3000/plugins

# Execute a plugin method (example)
curl -X POST http://localhost:3000/plugins/web-search-plugin/execute \
  -H "Content-Type: application/json" \
  -d '{"method": "search", "params": {"query": "node.js"}}'
```

Expected: Plugin list returned, plugin method executes successfully.

### Test 10: Tool System
```bash
# List available tools
curl http://localhost:3000/tools

# Execute a tool (example - datetime)
curl -X POST http://localhost:3000/tools/datetime/execute \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected: Tool list returned, tool executes and returns appropriate response.

## Monitoring Tests

### Test 11: Metrics Endpoint
```bash
# JSON format
curl http://localhost:3000/metrics

# Prometheus format
curl -H "Accept: text/plain" http://localhost:3000/metrics
```

Expected: Detailed metrics in JSON or Prometheus format.

### Test 12: Health Metrics
```bash
curl http://localhost:3000/metrics/health
curl http://localhost:3000/metrics/performance
```

Expected: Health and performance metrics returned.

## CLI Command Tests

### Test 13: All CLI Commands
```bash
# List models
melius-operarius models

# Start interactive chat
melius-operarius chat

# Run setup wizard
melius-operarius setup-wizard

# Test help
melius-operarius --help
```

Expected: Each command executes without errors.

### Test 14: Migration Test (if OpenClaw installed)
```bash
melius-operarius migrate-from-openclaw
```

Expected: Migration process starts and completes.

## Advanced Functionality Tests

### Test 15: Conversation History
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Remember my name is TestUser",
    "history": [],
    "model": "llama3"
  }'

curl -X POST http://localhost:3000/chat \
  -H "Content-Type" application/json" \
  -d '{
    "message": "What did I ask you to remember?",
    "history": [
      {"role": "user", "content": "Remember my name is TestUser"},
      {"role": "assistant", "content": "Okay, I will remember that your name is TestUser."}
    ],
    "model": "llama3"
  }'
```

Expected: Second request remembers context from first request.

### Test 16: Multiple Models
```bash
# Test with different models
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Say hello", "model": "llama3"}'

curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Say hello", "model": "mistral"}'
```

Expected: Responses from different models (if available).

## Error Handling Tests

### Test 17: Invalid Requests
```bash
# Request without message
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{}'

# Request with invalid model
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "model": "nonexistent-model"}'
```

Expected: Appropriate error messages returned.

## Performance Tests

### Test 18: Concurrency
```bash
# Run multiple requests simultaneously
for i in {1..5}; do
  curl -s http://localhost:3000/health &
done
wait
```

Expected: All requests succeed without errors.

### Test 19: Response Times
```bash
time curl -s http://localhost:3000/health
time curl -s http://localhost:3000/system
```

Expected: Responses in under 1 second.

## Quick Test Script

Run the quick test script to verify overall functionality:

```bash
npm run test:quick
```

Expected: Comprehensive test results showing which components are working.

## Docker Tests

### Test 20: Docker Deployment
```bash
# Build Docker image
npm run build:docker

# Run container
npm run docker:run
```

Expected: Service starts in Docker container and is accessible.

## Kubernetes Tests (if applicable)

### Test 21: Kubernetes Deployment
```bash
# Apply deployment
kubectl apply -f deploy/k8s-deployment.yaml

# Check status
kubectl get pods
kubectl get services
```

Expected: Pods running and service accessible.

## Expected Test Results

### ✅ Pass Indicators
- All API endpoints return 200 status codes
- Service starts without errors
- Web interface loads completely
- Chat functionality works with Ollama models
- Plugins load and execute properly
- Tools execute within security constraints
- Metrics endpoints return data
- CLI commands execute without errors

### ❌ Fail Indicators
- Service fails to start
- API endpoints return 500 errors
- Ollama connection failures
- Security violations
- Performance below thresholds

## Troubleshooting Common Issues

### Issue 1: Service Won't Start
**Symptoms**: Error message when running `melius-operarius start`
**Solutions**:
- Check if port 3000 is in use: `netstat -tulpn | grep :3000`
- Verify Node.js version: `node --version`
- Check Ollama is running: `ollama list`

### Issue 2: API Returns 404
**Symptoms**: API endpoints return 404 Not Found
**Solutions**:
- Ensure service is running
- Check URL paths are correct
- Verify no firewall blocking

### Issue 3: Model Not Responding
**Symptoms**: Chat endpoint returns errors or timeouts
**Solutions**:
- Verify model is pulled: `ollama list`
- Check model name is correct
- Ensure Ollama service is running: `ollama serve`

## Test Completion Checklist

Mark each test as completed:

- [ ] Global installation
- [ ] Service startup
- [ ] Health check endpoint
- [ ] Web interface
- [ ] Chat functionality
- [ ] Model management
- [ ] Plugin system
- [ ] Tool system
- [ ] Monitoring endpoints
- [ ] CLI commands
- [ ] Error handling
- [ ] Performance
- [ ] Quick test script
- [ ] Docker deployment (if applicable)

## Reporting Test Results

When reporting test results, include:
- System information (OS, Node.js version, npm version)
- Test steps followed
- Expected vs actual results
- Error messages received
- Screenshots if applicable
- Environment configuration