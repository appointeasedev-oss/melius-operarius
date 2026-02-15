# Testing Guide - Melius Operarius

This guide explains how to test Melius Operarius to ensure it works properly before and after deployment.

## Prerequisites for Testing

- Node.js 16+ installed
- Git installed
- Ollama installed and running (https://ollama.ai)
- At least 4GB free disk space for models

## Quick Test Setup

### Option 1: Test Without Installation
```bash
# Clone the repository
git clone https://github.com/appointeasedev-oss/melius-operarius.git
cd melius-operarius

# Install dependencies
npm install

# Run the setup wizard
npx melius-operarius setup-wizard

# Start the service
npm start
```

### Option 2: Test with Global Installation
```bash
# Install globally
npm install -g melius-operarius

# Run the one-command installer
install-melius

# Start the service
melius-operarius start
```

## Manual Testing Steps

### 1. Service Startup Test
1. Run: `npx melius-operarius start`
2. Verify the service starts without errors
3. Check that it's listening on the configured port (default 3000)
4. Look for success messages in the console

### 2. Health Check Test
1. Once running, visit: `http://localhost:3000/health`
2. You should see a JSON response with status: "healthy"
3. Verify timestamp and uptime are present

### 3. Web Interface Test
1. Visit: `http://localhost:3000/web`
2. Verify the web interface loads properly
3. Check that the system status indicators work
4. Verify the chat interface appears

### 4. API Endpoint Tests
Test these endpoints with curl or a REST client:

#### Health Check
```bash
curl http://localhost:3000/health
```

#### System Info
```bash
curl http://localhost:3000/system
```

#### Models List
```bash
curl http://localhost:3000/models
```

#### Chat Endpoint
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?", "model": "llama3"}'
```

### 5. CLI Command Tests
Run these commands separately:

```bash
# List models
npx melius-operarius models

# Start interactive chat
npx melius-operarius chat

# Run setup wizard
npx melius-operarius setup-wizard
```

### 6. Plugin System Test
1. Navigate to the plugins directory: `cd plugins`
2. Create a test plugin:
```javascript
// test-plugin.js
class TestPlugin {
  constructor() {
    this.name = 'Test Plugin';
  }

  async initialize() {
    console.log('Test plugin initialized');
    return true;
  }

  async testFunction(params) {
    return {
      success: true,
      message: 'Test plugin working!',
      params: params
    };
  }

  getAvailableMethods() {
    return [
      {
        name: 'testFunction',
        description: 'A test function'
      }
    ];
  }
}

module.exports = TestPlugin;
```

3. Place it in the plugins directory and restart the service
4. Test the plugin endpoint:
```bash
curl -X POST http://localhost:3000/plugins/test-plugin/execute \
  -H "Content-Type: application/json" \
  -d '{"method": "testFunction", "params": {"hello": "world"}}'
```

### 7. Tool System Test
Test the tool endpoints:

```bash
# List available tools
curl http://localhost:3000/tools

# Test a file operation (create a test file first)
echo "test content" > test.txt
curl -X POST http://localhost:3000/tools/read_file/execute \
  -H "Content-Type: application/json" \
  -d '{"path": "./test.txt"}'
```

## Automated Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Integration Tests
```bash
# Start the service in one terminal
npm start

# Run integration tests in another terminal
npm run test:integration
```

## Performance Testing

### Load Testing
Use a tool like Apache Bench or Artillery:

```bash
# Install artillery
npm install -g artillery

# Run a simple load test
artillery quick --count 10 --num 20 'http://localhost:3000/health'
```

### Stress Test
```bash
# Test concurrent requests
for i in {1..10}; do
  curl -s http://localhost:3000/health &
done
wait
```

## End-to-End Testing

### Scenario: Complete Workflow
1. Start the service: `npm start`
2. Verify health: `curl http://localhost:3000/health`
3. Check system status: `curl http://localhost:3000/system`
4. List models: `curl http://localhost:3000/models`
5. Send a chat message:
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is AI?", "model": "llama3"}'
```
6. Try the web interface at `http://localhost:3000/web`

## Troubleshooting Common Issues

### Service Won't Start
- Check if Ollama is running: `ollama list`
- Verify port 3000 is not in use
- Check Node.js version (must be 16+)

### API Calls Return Errors
- Verify the service is running
- Check the request format matches API expectations
- Look at server logs for error details

### Web Interface Not Loading
- Clear browser cache
- Check browser console for errors
- Verify the service is running and accessible

### Model Operations Fail
- Verify Ollama models are pulled: `ollama list`
- Check Ollama service is running: `ollama serve`
- Verify model names are correct

## Test Results Verification

### Success Indicators
- ✅ Service starts without errors
- ✅ Health check returns healthy status
- ✅ All API endpoints return expected responses
- ✅ Web interface loads and functions
- ✅ Chat functionality works with Ollama models
- ✅ Plugins load and execute properly
- ✅ Tools execute successfully
- ✅ All automated tests pass

### Failure Indicators
- ❌ Service fails to start
- ❌ API endpoints return 500 errors
- ❌ Ollama connection failures
- ❌ Missing dependencies
- ❌ Tests failing

## Reporting Issues

If you encounter any issues during testing:

1. Note the exact steps to reproduce
2. Include error messages and logs
3. Mention your system configuration (OS, Node.js version, etc.)
4. Submit to the GitHub repository issues section

## Ready for Production?

Before declaring production-ready, verify:
- [ ] All automated tests pass
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Installation process smooth
- [ ] All features working as expected