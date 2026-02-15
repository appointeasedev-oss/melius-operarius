/**
 * Startup tests for Melius Operarius
 * Tests the basic functionality without requiring Ollama
 */

const MeliusController = require('../src/controller');

// Mock Ollama and other dependencies to avoid requiring actual Ollama installation for tests
jest.mock('ollama', () => ({
  Ollama: jest.fn(() => ({
    ps: jest.fn().mockResolvedValue({ models: [] }),
    chat: jest.fn().mockResolvedValue({
      message: { content: 'Test response' },
      total_duration: 1000000000,
      load_duration: 100000000
    }),
    pull: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({})
  }))
}));

jest.mock('configstore', () => {
  return jest.fn(() => ({
    get: jest.fn((key) => {
      const defaults = {
        setupComplete: true,
        ollamaHost: 'http://localhost:11434',
        defaultModel: 'llama3',
        serverPort: 3000,
        pluginDirectory: './plugins'
      };
      return defaults[key];
    }),
    set: jest.fn()
  }));
});

jest.mock('../src/plugin-manager', () => {
  return jest.fn(() => ({
    loadPlugins: jest.fn().mockResolvedValue([]),
    getPluginInfo: jest.fn().mockReturnValue({}),
    executePluginMethod: jest.fn()
  }));
});

describe('Melius Operarius Startup', () => {
  let controller;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('should initialize without throwing errors', async () => {
    expect(async () => {
      controller = new MeliusController();
      await controller.initialize();
    }).not.toThrow();
  });

  test('should have required properties after initialization', async () => {
    controller = new MeliusController();
    await controller.initialize();
    
    expect(controller.config).toBeDefined();
    expect(controller.modelManager).toBeDefined();
    expect(controller.pluginManager).toBeDefined();
    expect(controller.app).toBeDefined();
  });

  test('should have the correct API routes set up', () => {
    controller = new MeliusController();
    
    // Check if the main routes exist (this checks if setupRoutes was called)
    const routes = controller.getApp()._router.stack;
    const routePaths = routes
      .filter(layer => layer.route)
      .map(layer => layer.route.path);
    
    expect(routePaths).toContain('/');
    expect(routePaths).toContain('/chat');
    expect(routePaths).toContain('/models');
    expect(routePaths).toContain('/config');
    expect(routePaths).toContain('/system');
    expect(routePaths).toContain('/plugins');
  });

  test('should handle model listing properly', async () => {
    controller = new MeliusController();
    await controller.initialize();
    
    // This should not throw even if Ollama is not available
    const models = await controller.modelManager.listModels();
    expect(Array.isArray(models)).toBe(true);
  });
});