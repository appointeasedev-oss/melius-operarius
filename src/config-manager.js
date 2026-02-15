/**
 * Simple Configuration Manager for Melius Operarius
 * Provides configuration management without relying on external libraries
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class ConfigManager {
  constructor(appName = 'melius-operarius') {
    this.appName = appName;
    this.configDir = path.join(os.homedir(), '.config', appName);
    this.configPath = path.join(this.configDir, 'config.json');
    this.defaults = {
      setupComplete: false,
      ollamaHost: 'http://localhost:11434',
      defaultModel: 'llama3',
      serverPort: 3000,
      pluginDirectory: './plugins',
      logLevel: 'info',
      maxTokens: 2048
    };
    
    // Ensure config directory exists
    this.ensureConfigDir();
  }

  /**
   * Ensure config directory exists
   */
  async ensureConfigDir() {
    try {
      await fs.mkdir(this.configDir, { recursive: true });
    } catch (error) {
      // If we can't create the directory, use a local config file
      this.configDir = './config';
      this.configPath = './config.json';
      await fs.mkdir(this.configDir, { recursive: true });
    }
  }

  /**
   * Load configuration from file
   */
  async load() {
    try {
      const data = await fs.readFile(this.configPath, 'utf8');
      const config = JSON.parse(data);
      return { ...this.defaults, ...config };
    } catch (error) {
      // If config file doesn't exist, return defaults
      return { ...this.defaults };
    }
  }

  /**
   * Save configuration to file
   */
  async save(config) {
    try {
      await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving config:', error.message);
      return false;
    }
  }

  /**
   * Get a configuration value
   */
  async get(key) {
    const config = await this.load();
    return config[key];
  }

  /**
   * Set a configuration value
   */
  async set(key, value) {
    const config = await this.load();
    config[key] = value;
    return await this.save(config);
  }

  /**
   * Get all configuration
   */
  async getAll() {
    return await this.load();
  }

  /**
   * Reset configuration to defaults
   */
  async reset() {
    await this.save(this.defaults);
  }
}

module.exports = ConfigManager;