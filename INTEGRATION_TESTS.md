# Integration Tests - Melius Operarius

Comprehensive integration tests to verify all components work together properly.

## Test Suite 1: End-to-End Workflow

### Test 1.1: Complete Chat Flow
**Objective**: Verify the complete flow from user input to AI response
```gherkin
Given Melius Operarius is running
And Ollama is accessible
And a model is available
When a user sends a chat message
Then the system processes the request
And returns an AI-generated response
And the response is properly formatted
```

**Steps**:
1. Start the service
2. Send a test message via API
3. Verify response format and content
4. Check response time is acceptable (<10s)

### Test 1.2: Model Switching
**Objective**: Verify ability to switch between different Ollama models
```gherkin
Given Melius Operarius is running
And multiple models are available in Ollama
When a user requests response from different models
Then each model responds appropriately
And response quality varies by model as expected
```

## Test Suite 2: Plugin Integration

### Test 2.1: Plugin Loading
**Objective**: Verify plugins load correctly at startup
```gherkin
Given plugin files exist in plugins directory
When Melius Operarius starts
Then all valid plugins are loaded
And plugin methods are registered
And no errors occur during loading
```

**Steps**:
1. Place test plugins in plugins/ directory
2. Start Melius Operarius
3. Check logs for successful plugin loading
4. Verify plugins appear in /plugins endpoint

### Test 2.2: Plugin Execution
**Objective**: Verify plugins execute correctly through API
```gherkin
Given a plugin is loaded
When a user calls a plugin method via API
Then the plugin executes successfully
And returns expected results
And follows security constraints
```

## Test Suite 3: Tool Integration

### Test 3.1: Tool Execution
**Objective**: Verify system tools execute correctly
```gherkin
Given Melius Operarius is running
When a user executes a system tool
Then the tool executes with proper parameters
And returns appropriate results
And follows security restrictions
```

**Test Cases**:
- File reading/writing within allowed directories
- Shell command execution with limitations
- Web operations with security constraints

### Test 3.2: Tool Security
**Objective**: Verify tools cannot perform unauthorized operations
```gherkin
Given Melius Operarius is running
When a user attempts to access restricted resources via tools
Then the operation is blocked
And appropriate error is returned
And system security is maintained
```

## Test Suite 4: API Integration

### Test 4.1: API Consistency
**Objective**: Verify all API endpoints follow consistent patterns
```gherkin
Given Melius Operarius is running
When requests are made to different API endpoints
Then responses follow consistent structure
And error handling is uniform
And authentication is enforced where needed
```

### Test 4.2: API Performance
**Objective**: Verify API endpoints meet performance requirements
```gherkin
Given Melius Operarius is running under normal load
When multiple API requests are made concurrently
Then response times remain acceptable
And no race conditions occur
And system stability is maintained
```

## Test Suite 5: Configuration Integration

### Test 5.1: Configuration Loading
**Objective**: Verify configuration loads and applies correctly
```gherkin
Given configuration files exist
When Melius Operarius starts
Then configuration values are loaded
And system operates according to configuration
And changes are reflected in behavior
```

### Test 5.2: Runtime Configuration
**Objective**: Verify configuration can be changed at runtime
```gherkin
Given Melius Operarius is running
When configuration is updated via API
Then changes take effect immediately
And service continues operating normally
And new settings are validated
```

## Test Suite 6: Web Interface Integration

### Test 6.1: Frontend-Backend Communication
**Objective**: Verify web interface communicates properly with backend
```gherkin
Given Melius Operarius is running
When user interacts with web interface
Then requests are properly formatted
And responses are handled correctly
And UI updates appropriately
```

### Test 6.2: Real-time Updates
**Objective**: Verify real-time information updates in web interface
```gherkin
Given web interface is loaded
When system state changes
Then interface updates automatically
And user sees current system status
And no manual refresh is required
```

## Test Suite 7: Migration Integration

### Test 7.1: OpenClaw Migration
**Objective**: Verify migration from OpenClaw works correctly
```gherkin
Given OpenClaw configuration exists
When migration command is executed
Then settings are properly transferred
And Melius Operarius operates with migrated settings
And no data loss occurs
```

## Running Integration Tests

### Prerequisites
```bash
# Ensure Ollama is running
ollama serve &

# Install dependencies
npm install

# Pull a test model
ollama pull llama3
```

### Execute Tests
```bash
# Run all integration tests
npm run test:integration

# Run specific test suite
npm run test:integration -- --suite=e2e

# Run with coverage
npm run test:integration -- --coverage
```

### Automated Test Runner
```bash
# Continuous integration mode
npm run test:integration -- --watch

# Run in Docker container
docker run --rm -v $(pwd):/app -w /app node:18 npm run test:integration
```

## Expected Results

### Success Criteria
- All test suites pass (100% success rate)
- Average response time < 2 seconds
- Zero security vulnerabilities detected
- All configuration options functional
- All plugins load and operate correctly
- Web interface fully responsive
- Migration preserves all settings

### Performance Benchmarks
- API response time: <2s average, <5s max
- Concurrent users: 100+ simultaneous connections
- Memory usage: <512MB baseline
- CPU usage: <50% under load
- Startup time: <10 seconds

## Reporting

### Test Reports
- Individual test results logged to `./test-results/`
- Performance metrics collected in `./performance/`
- Security scans reported in `./security/`
- Coverage reports in `./coverage/`

### Continuous Integration
- GitHub Actions workflow
- Automated testing on push/PR
- Performance regression detection
- Security vulnerability scanning
- Code coverage requirements (>80%)

## Maintenance

### Test Updates
- Add new tests when features are added
- Update existing tests when functionality changes
- Remove obsolete tests when features are deprecated
- Review and optimize slow-running tests

### Environment Requirements
- Dedicated test environment
- Isolated test data
- Clean state before each test run
- Proper cleanup after tests complete