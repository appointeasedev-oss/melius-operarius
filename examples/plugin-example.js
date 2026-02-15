/**
 * Example plugin for Melius Operarius
 * Demonstrates how plugins can extend functionality
 */

class ExamplePlugin {
  constructor(config) {
    this.name = 'Example Plugin';
    this.description = 'An example plugin showing how to extend Melius Operarius';
    this.config = config || {};
  }

  /**
   * Called when the plugin is initialized
   */
  async initialize() {
    console.log(`${this.name} is initializing...`);
    // Perform any setup required by the plugin
    return true;
  }

  /**
   * Called when the plugin is loaded
   */
  async load() {
    console.log(`${this.name} has been loaded`);
    return true;
  }

  /**
   * Example command that can be invoked
   */
  async exampleCommand(params) {
    const { input } = params || {};
    return {
      success: true,
      message: `Example plugin processed: ${input}`,
      data: {
        originalInput: input,
        processed: true,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Return available methods that can be called
   */
  getAvailableMethods() {
    return [
      {
        name: 'exampleCommand',
        description: 'Processes an example command',
        parameters: {
          input: {
            type: 'string',
            description: 'Input to process',
            required: true
          }
        }
      }
    ];
  }

  /**
   * Called when the plugin is unloaded
   */
  async unload() {
    console.log(`${this.name} is unloading...`);
    return true;
  }
}

module.exports = ExamplePlugin;