/**
 * Plugin Manager for Melius Operarius
 * Handles loading, managing, and executing plugins
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob'); // Would need to be added to package.json in real implementation

class PluginManager {
  constructor(options = {}) {
    this.pluginDirectory = options.pluginDirectory || './plugins';
    this.plugins = new Map();
    this.hooks = new Map(); // For hook-based plugin system
  }

  /**
   * Load all plugins from the plugin directory
   */
  async loadPlugins() {
    console.log(`Loading plugins from: ${this.pluginDirectory}`);
    
    try {
      // Ensure plugin directory exists
      await fs.mkdir(this.pluginDirectory, { recursive: true });
      
      // Find all JavaScript files in the plugin directory
      const pluginFiles = await this.findPluginFiles();
      
      for (const file of pluginFiles) {
        await this.loadPlugin(file);
      }
      
      console.log(`Loaded ${this.plugins.size} plugins`);
      return Array.from(this.plugins.keys());
    } catch (error) {
      console.error('Error loading plugins:', error.message);
      return [];
    }
  }

  /**
   * Find all plugin files in the directory
   */
  async findPluginFiles() {
    // In a real implementation, we'd use glob or fs.walk
    // For now, we'll look for .js files in the plugin directory
    try {
      const items = await fs.readdir(this.pluginDirectory);
      const jsFiles = items.filter(item => 
        item.endsWith('.js') && item !== 'index.js'
      );
      
      return jsFiles.map(file => path.join(this.pluginDirectory, file));
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Directory doesn't exist, that's OK
        return [];
      }
      throw error;
    }
  }

  /**
   * Load a single plugin file
   */
  async loadPlugin(pluginPath) {
    try {
      // Resolve the full path
      const fullPath = path.resolve(pluginPath);
      const pluginName = path.basename(pluginPath, '.js');
      
      // Dynamically import the plugin
      const PluginClass = require(fullPath);
      
      // Instantiate the plugin
      const pluginInstance = new PluginClass();
      
      // Initialize the plugin
      if (typeof pluginInstance.initialize === 'function') {
        await pluginInstance.initialize();
      }
      
      // Register the plugin
      this.plugins.set(pluginName, {
        instance: pluginInstance,
        path: fullPath,
        loaded: true
      });
      
      console.log(`✓ Loaded plugin: ${pluginName}`);
      
      // Register hooks if the plugin defines them
      if (typeof pluginInstance.registerHooks === 'function') {
        await pluginInstance.registerHooks(this);
      }
      
      return true;
    } catch (error) {
      console.error(`✗ Failed to load plugin ${pluginPath}:`, error.message);
      return false;
    }
  }

  /**
   * Execute a method on a specific plugin
   */
  async executePluginMethod(pluginName, methodName, params = {}) {
    const plugin = this.plugins.get(pluginName);
    
    if (!plugin || !plugin.loaded) {
      throw new Error(`Plugin '${pluginName}' is not loaded`);
    }
    
    const instance = plugin.instance;
    
    if (typeof instance[methodName] !== 'function') {
      throw new Error(`Method '${methodName}' does not exist in plugin '${pluginName}'`);
    }
    
    try {
      return await instance[methodName](params);
    } catch (error) {
      console.error(`Error executing ${pluginName}.${methodName}:`, error.message);
      throw error;
    }
  }

  /**
   * Execute a method across all plugins that have it
   */
  async executeMethodOnAllPlugins(methodName, params = {}) {
    const results = [];
    
    for (const [pluginName, plugin] of this.plugins.entries()) {
      if (plugin.loaded && typeof plugin.instance[methodName] === 'function') {
        try {
          const result = await plugin.instance[methodName](params);
          results.push({
            plugin: pluginName,
            result,
            success: true
          });
        } catch (error) {
          results.push({
            plugin: pluginName,
            error: error.message,
            success: false
          });
        }
      }
    }
    
    return results;
  }

  /**
   * Register a hook that plugins can subscribe to
   */
  registerHook(hookName, callback) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    
    this.hooks.get(hookName).push(callback);
  }

  /**
   * Execute all callbacks registered for a hook
   */
  async executeHook(hookName, data) {
    if (!this.hooks.has(hookName)) {
      return data;
    }
    
    let result = data;
    
    for (const callback of this.hooks.get(hookName)) {
      try {
        result = await callback(result);
      } catch (error) {
        console.error(`Error in hook '${hookName}' callback:`, error.message);
      }
    }
    
    return result;
  }

  /**
   * Get information about loaded plugins
   */
  getPluginInfo() {
    const info = {};
    
    for (const [pluginName, plugin] of this.plugins.entries()) {
      info[pluginName] = {
        loaded: plugin.loaded,
        path: plugin.path,
        methods: []
      };
      
      // Get available methods from the plugin
      if (plugin.instance && typeof plugin.instance.getAvailableMethods === 'function') {
        info[pluginName].methods = plugin.instance.getAvailableMethods();
      } else {
        // Fallback: get all callable methods
        const instance = plugin.instance;
        for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(instance))) {
          if (typeof instance[key] === 'function' && key !== 'constructor') {
            info[pluginName].methods.push(key);
          }
        }
      }
    }
    
    return info;
  }

  /**
   * Reload a specific plugin
   */
  async reloadPlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    
    if (!plugin) {
      throw new Error(`Plugin '${pluginName}' does not exist`);
    }
    
    // Unload the plugin
    if (typeof plugin.instance.unload === 'function') {
      await plugin.instance.unload();
    }
    
    // Clear the module cache to force reload
    delete require.cache[require.resolve(path.resolve(plugin.path))];
    
    // Reload the plugin
    await this.loadPlugin(plugin.path);
  }

  /**
   * Unload all plugins
   */
  async unloadAllPlugins() {
    for (const [pluginName, plugin] of this.plugins.entries()) {
      if (plugin.loaded && typeof plugin.instance.unload === 'function') {
        try {
          await plugin.instance.unload();
        } catch (error) {
          console.error(`Error unloading plugin ${pluginName}:`, error.message);
        }
      }
    }
    
    this.plugins.clear();
    this.hooks.clear();
  }
}

module.exports = PluginManager;