# Development Guide for Melius Operarius

This guide explains how to contribute to and extend Melius Operarius.

## Project Structure

```
melius-operarius/
├── src/
│   ├── controller.js         # Main application controller
│   ├── model-manager.js      # Ollama model management
│   └── plugin-manager.js     # Plugin system management
├── plugins/                  # Plugin implementations
├── config/                   # Configuration files
├── docs/                     # Documentation
├── tests/                    # Test files
├── examples/                 # Example implementations
├── index.js                  # Main application entry point
├── install.js                # Installation script
├── README.md                 # Main project documentation
└── package.json             # Project dependencies and scripts
```

## Core Components

### Controller (src/controller.js)
The main orchestrator that:
- Sets up the Express.js server
- Initializes model and plugin managers
- Defines API routes
- Handles incoming requests

### Model Manager (src/model-manager.js)
Handles all Ollama-related operations:
- Listing available models
- Pulling new models
- Generating AI responses
- Managing model configurations

### Plugin Manager (src/plugin-manager.js)
Manages extensibility through plugins:
- Loading plugins from the plugins directory
- Executing plugin methods
- Managing hooks system
- Providing plugin lifecycle management

## Setting Up Development Environment

1. **Prerequisites**
   - Node.js 16+ installed
   - Git installed
   - Ollama installed (https://ollama.ai)

2. **Clone and Install**
   ```bash
   git clone https://github.com/appointeasedev-oss/melius-operarius.git
   cd melius-operarius
   npm install
   ```

3. **Setup Configuration**
   ```bash
   npx melius-operarius setup
   ```

4. **Run in Development Mode**
   ```bash
   npm run dev
   ```

## Creating Plugins

Plugins extend Melius Operarius functionality. To create a plugin:

1. **Create a new file** in the `plugins/` directory
2. **Follow the plugin interface**:
   ```javascript
   class MyPlugin {
     constructor(config) {
       this.name = 'My Plugin';
       this.description = 'Does amazing things';
       this.config = config || {};
     }

     async initialize() {
       // Called during plugin initialization
       return true;
     }

     async load() {
       // Called when plugin is loaded
       return true;
     }

     getAvailableMethods() {
       // Define what methods are available
       return [
         {
           name: 'myMethod',
           description: 'Does something',
           parameters: {
             param1: {
               type: 'string',
               description: 'A parameter',
               required: true
             }
           }
         }
       ];
     }

     async myMethod(params) {
       // Implementation of the method
       return { success: true, result: 'done' };
     }

     async unload() {
       // Cleanup when plugin is unloaded
       return true;
     }
   }

   module.exports = MyPlugin;
   ```

3. **Save the file** in the `plugins/` directory with a `.js` extension

## API Design Principles

- **Consistency**: Follow REST principles where applicable
- **Error Handling**: Always return appropriate HTTP status codes
- **Documentation**: Document all new endpoints
- **Validation**: Validate input parameters
- **Security**: Sanitize all inputs

## Testing

Run the test suite:
```bash
npm test
```

Add new tests in the `tests/` directory following Jest conventions.

## Coding Standards

- Use ES6+ features appropriately
- Follow Airbnb JavaScript Style Guide
- Write meaningful commit messages
- Add JSDoc comments for exported functions
- Keep functions focused and small

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Run the test suite (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Architecture Decisions

### Why Local Models?
- Privacy: Data never leaves the user's device
- Cost: No ongoing API costs
- Availability: Works offline
- Control: User owns their models and data

### Why Plugin Architecture?
- Extensibility: Easy to add new functionality
- Modularity: Keep core lightweight
- Community: Allow others to contribute features
- Flexibility: Enable custom workflows

### Why Ollama Integration?
- Open Source: Aligns with project values
- Local Execution: True local AI processing
- Model Variety: Access to many open models
- Active Development: Well-maintained project

## Troubleshooting

### Common Issues:

1. **Ollama not found**: Ensure Ollama is installed and running
2. **Port in use**: Change the server port in configuration
3. **Plugin not loading**: Check the plugin follows the interface correctly
4. **Model not responding**: Verify the model is properly pulled in Ollama

### Debugging Tips:
- Check logs in the `./logs` directory
- Use `npx melius-operarius models` to verify model availability
- Enable verbose logging in configuration

## Getting Help

- Check the existing issues for similar problems
- Join the community discussions
- File a detailed issue if you encounter a bug
- Contact the maintainers through the appropriate channels

---

Happy coding! Remember that Melius Operarius aims to make AI accessible, private, and controllable for everyone.