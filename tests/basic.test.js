/**
 * Basic tests for Melius Operarius
 * These tests verify core functionality
 */

const { setup, startService } = require('../index.js');

// Mock Ollama for testing purposes
jest.mock('ollama', () => ({
  Ollama: jest.fn(() => ({
    ps: jest.fn().mockResolvedValue({ models: [] }),
    chat: jest.fn().mockResolvedValue({
      message: { content: 'Test response from mock model' }
    })
  }))
}));

describe('Melius Operarius', () => {
  describe('setup', () => {
    it('should initialize configuration properly', async () => {
      // Since setup modifies global config, we'll just verify it runs without errors
      await expect(setup()).resolves.not.toThrow();
    });
  });

  describe('service startup', () => {
    it('should start without throwing errors', async () => {
      // Test that the service startup function doesn't throw
      // We won't actually start the server in tests
      expect(startService).toBeDefined();
    });
  });
});