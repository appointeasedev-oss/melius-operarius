/**
 * Main Controller for Melius Operarius
 * Orchestrates all core functionality
 */

const ModelManager = require('./model-manager');
const PluginManager = require('./plugin-manager');
const ToolManager = require('./tool-manager');
const MonitoringService = require('./monitoring');
const ConfigManager = require('./config-manager');
const express = require('express');
const path = require('path');

class MeliusController {
  constructor(options = {}) {
    this.config = new ConfigManager('melius-operarius');
    this.app = express();
  }

  async initializeComponents() {
    // Load config and initialize components
    const configValues = await this.config.getAll();
    
    this.modelManager = new ModelManager({
      host: configValues.ollamaHost,
      defaultModel: configValues.defaultModel,
      modelsDir: './models'
    });
    
    this.pluginManager = new PluginManager({
      pluginDirectory: configValues.pluginDirectory
    });
    
    this.toolManager = new ToolManager();
    
    this.monitoringService = new MonitoringService({
      collectMetrics: true,
      logPerformance: true,
      healthCheckInterval: 30000
    });
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Set up middleware for the Express app
   */
  setupMiddleware() {
    // Request timing middleware
    this.app.use((req, res, next) => {
      req.startTime = Date.now();
      next();
    });
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Serve static files from web directory
    this.app.use('/web', express.static(path.join(__dirname, '../web')));
    
    // Serve the web interface at root
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../web/index.html'));
    });
    
    // CORS for local development
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
    
    // Request logging and metrics collection
    this.app.use((req, res, next) => {
      // Capture the original end method
      const originalEnd = res.end;
      
      res.end = (function(chunk, encoding) {
        // Record the request metrics
        this.monitoringService.recordRequest(req, res, req.startTime);
        
        // Call the original end method
        originalEnd.call(res, chunk, encoding);
      }).bind(this);
      
      next();
    });
  }

  /**
   * Set up API routes
   */
  async setupRoutes() {
    // Get config values
    const configValues = await this.config.getAll();
    
    // Health check
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Melius Operarius',
        version: '0.1.0',
        status: 'operational',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });

    // Chat endpoint
    this.app.post('/chat', async (req, res) => {
      const { message, history = [], model, options } = req.body;
      
      if (!message) {
        return res.status(400).json({
          error: 'Message is required'
        });
      }

      try {
        // Format messages for Ollama (user message + any history)
        const messages = [
          ...history,
          { role: 'user', content: message }
        ];

        const result = await this.modelManager.generateResponse(messages, {
          model: model || configValues.defaultModel,
          ...options
        });

        res.json(result);
      } catch (error) {
        res.status(500).json({
          error: error.message,
          success: false
        });
      }
    });

    // Models endpoints
    this.app.get('/models', async (req, res) => {
      try {
        const models = await this.modelManager.listModels();
        res.json({
          models: models,
          count: models.length,
          default: configValues.defaultModel
        });
      } catch (error) {
        res.status(500).json({
          error: error.message
        });
      }
    });

    this.app.post('/models/pull', async (req, res) => {
      const { model } = req.body;
      
      if (!model) {
        return res.status(400).json({
          error: 'Model name is required'
        });
      }

      try {
        const success = await this.modelManager.pullModel(model);
        if (success) {
          res.json({
            message: `Model ${model} pulled successfully`,
            success: true
          });
        } else {
          res.status(500).json({
            error: `Failed to pull model ${model}`,
            success: false
          });
        }
      } catch (error) {
        res.status(500).json({
          error: error.message,
          success: false
        });
      }
    });

    // Configuration endpoints
    this.app.get('/config', async (req, res) => {
      const currentConfig = await this.config.getAll();
      res.json({
        setupComplete: currentConfig.setupComplete,
        ollamaHost: currentConfig.ollamaHost,
        defaultModel: currentConfig.defaultModel,
        serverPort: currentConfig.serverPort
      });
    });

    this.app.post('/config', async (req, res) => {
      const { ollamaHost, defaultModel, serverPort } = req.body;
      
      if (ollamaHost !== undefined) await this.config.set('ollamaHost', ollamaHost);
      if (defaultModel !== undefined) await this.config.set('defaultModel', defaultModel);
      if (serverPort !== undefined) await this.config.set('serverPort', serverPort);
      
      await this.config.set('setupComplete', true);
      
      const updatedConfig = await this.config.getAll();
      
      res.json({
        message: 'Configuration updated',
        config: {
          ollamaHost: updatedConfig.ollamaHost,
          defaultModel: updatedConfig.defaultModel,
          serverPort: updatedConfig.serverPort,
          setupComplete: true
        }
      });
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const healthStatus = this.monitoringService.getHealthStatus();
      res.json(healthStatus);
    });

    // System info endpoint
    this.app.get('/system', async (req, res) => {
      try {
        const [models, pluginInfo] = await Promise.all([
          this.modelManager.listModels(),
          this.getPluginInfoSafely()
        ]);
        
        const currentConfig = await this.config.getAll();
        const healthStatus = this.monitoringService.getHealthStatus();
        
        res.json({
          system: {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            uptime: process.uptime()
          },
          ollama: {
            host: currentConfig.ollamaHost,
            modelsCount: models.length,
            defaultModel: currentConfig.defaultModel
          },
          plugins: pluginInfo,
          health: healthStatus,
          app: {
            name: 'Melius Operarius',
            version: '0.1.0',
            setupComplete: currentConfig.setupComplete
          }
        });
      } catch (error) {
        res.status(500).json({
          error: error.message
        });
      }
    });

    // Monitoring endpoints
    this.app.get('/metrics', (req, res) => {
      if (req.headers.accept && req.headers.accept.includes('text/plain')) {
        // Prometheus format
        res.set('Content-Type', 'text/plain');
        res.send(this.monitoringService.exportPrometheusMetrics());
      } else {
        // JSON format
        res.json(this.monitoringService.getDetailedMetrics());
      }
    });

    this.app.get('/metrics/health', (req, res) => {
      res.json(this.monitoringService.getHealthStatus());
    });

    this.app.get('/metrics/performance', (req, res) => {
      const metrics = this.monitoringService.getDetailedMetrics();
      res.json({
        performance: metrics.recent.performance,
        system: metrics.system,
        avgResponseTime: metrics.recent.requests.avgDuration
      });
    });

    // Plugin endpoints
    this.app.get('/plugins', async (req, res) => {
      try {
        const pluginInfo = this.pluginManager.getPluginInfo();
        res.json({
          plugins: pluginInfo,
          count: Object.keys(pluginInfo).length
        });
      } catch (error) {
        res.status(500).json({
          error: error.message
        });
      }
    });

    this.app.post('/plugins/:pluginName/execute', async (req, res) => {
      const { pluginName } = req.params;
      const { method, params } = req.body;
      
      if (!method) {
        return res.status(400).json({
          error: 'Method is required'
        });
      }

      try {
        const result = await this.pluginManager.executePluginMethod(pluginName, method, params);
        res.json({
          success: true,
          result: result,
          plugin: pluginName,
          method: method
        });
      } catch (error) {
        res.status(500).json({
          error: error.message,
          success: false
        });
      }
    });

    // Tool endpoints
    this.app.get('/tools', async (req, res) => {
      try {
        const tools = this.toolManager.getAvailableTools();
        res.json({
          tools: tools,
          count: Object.keys(tools).length
        });
      } catch (error) {
        res.status(500).json({
          error: error.message
        });
      }
    });

    this.app.post('/tools/:toolName/execute', async (req, res) => {
      const { toolName } = req.params;
      const params = req.body;
      
      try {
        const result = await this.toolManager.executeTool(toolName, params);
        res.json({
          success: true,
          result: result,
          tool: toolName
        });
      } catch (error) {
        res.status(500).json({
          error: error.message,
          success: false
        });
      }
    });
  }

  /**
   * Safely get plugin info (handles potential errors)
   */
  async getPluginInfoSafely() {
    try {
      return this.pluginManager.getPluginInfo();
    } catch (error) {
      console.error('Error getting plugin info:', error.message);
      return { error: 'Could not retrieve plugin information' };
    }
  }

  /**
   * Initialize the controller
   */
  async initialize() {
    console.log('Initializing Melius Operarius Controller...');
    
    // Initialize components with config
    await this.initializeComponents();
    
    // Verify Ollama connection
    try {
      await this.modelManager.listModels();
      console.log('✓ Connected to Ollama server');
    } catch (error) {
      console.warn('⚠ Could not connect to Ollama server:', error.message);
      const configValues = await this.config.getAll();
      console.log('Make sure Ollama is installed and running at:', configValues.ollamaHost);
    }
    
    // Load plugins
    try {
      await this.pluginManager.loadPlugins();
      console.log('✓ Plugins loaded successfully');
    } catch (error) {
      console.warn('⚠ Error loading plugins:', error.message);
    }
    
    // Tool manager is initialized in constructor
    console.log('✓ Tool manager initialized');
    
    return true;
  }

  /**
   * Start the HTTP server
   */
  async startServer() {
    const configValues = await this.config.getAll();
    const port = configValues.serverPort;
    
    return new Promise((resolve, reject) => {
      const server = this.app.listen(port, () => {
        console.log(`🚀 Melius Operarius server running on http://localhost:${port}`);
        console.log(`📋 API documentation available at http://localhost:${port}/api/docs`);
        console.log(`🔧 Models endpoint: http://localhost:${port}/models`);
        console.log(`💬 Chat endpoint: http://localhost:${port}/chat`);
        resolve(server);
      });
      
      server.on('error', (err) => {
        console.error('Failed to start server:', err);
        reject(err);
      });
    });
  }

  /**
   * Get the Express app instance
   */
  getApp() {
    return this.app;
  }
}

module.exports = MeliusController;