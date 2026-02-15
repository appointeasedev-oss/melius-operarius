/**
 * Model Manager for Melius Operarius
 * Handles local Ollama model operations
 */

const { Ollama } = require('ollama');
const fs = require('fs').promises;
const path = require('path');

class ModelManager {
  constructor(config = {}) {
    this.config = config;
    this.ollama = new Ollama({ 
      host: config.host || 'http://localhost:11434' 
    });
    this.modelsDir = config.modelsDir || './models';
  }

  /**
   * List all available models
   */
  async listModels() {
    try {
      const response = await this.ollama.ps();
      return response.models || [];
    } catch (error) {
      console.error('Error listing models:', error.message);
      return [];
    }
  }

  /**
   * Pull a model from Ollama registry
   */
  async pullModel(modelName) {
    try {
      console.log(`Pulling model: ${modelName}`);
      
      // Stream the progress
      const stream = await this.ollama.pull({ model: modelName, stream: true });
      
      for await (const chunk of stream) {
        if (chunk.status) {
          console.log(chunk.status);
        }
      }
      
      console.log(`✓ Model ${modelName} pulled successfully`);
      return true;
    } catch (error) {
      console.error(`Error pulling model ${modelName}:`, error.message);
      return false;
    }
  }

  /**
   * Check if a model exists locally
   */
  async modelExists(modelName) {
    const models = await this.listModels();
    return models.some(model => model.name === modelName);
  }

  /**
   * Delete a model
   */
  async deleteModel(modelName) {
    try {
      await this.ollama.delete({ model: modelName });
      console.log(`✓ Model ${modelName} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Error deleting model ${modelName}:`, error.message);
      return false;
    }
  }

  /**
   * Generate a chat response using a specific model
   */
  async generateResponse(messages, options = {}) {
    const {
      model = this.config.defaultModel || 'llama3',
      temperature = 0.7,
      max_tokens = 2048
    } = options;

    try {
      const response = await this.ollama.chat({
        model: model,
        messages: messages,
        options: {
          temperature: temperature,
        }
      });

      return {
        success: true,
        response: response.message.content,
        model: model,
        total_duration: response.total_duration,
        load_duration: response.load_duration
      };
    } catch (error) {
      console.error('Error generating response:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get model information
   */
  async getModelInfo(modelName) {
    try {
      const models = await this.listModels();
      return models.find(model => model.name === modelName);
    } catch (error) {
      console.error('Error getting model info:', error.message);
      return null;
    }
  }

  /**
   * Create a model manifest for tracking
   */
  async createModelManifest(modelName, metadata = {}) {
    const manifest = {
      name: modelName,
      createdAt: new Date().toISOString(),
      metadata: metadata,
      version: '1.0.0'
    };

    const manifestPath = path.join(this.modelsDir, `${modelName}.json`);
    
    try {
      await fs.mkdir(this.modelsDir, { recursive: true });
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      return true;
    } catch (error) {
      console.error('Error creating model manifest:', error.message);
      return false;
    }
  }

  /**
   * Get recommended models for different use cases
   */
  getRecommendedModels() {
    return {
      general: 'llama3',
      coding: 'codellama',
      reasoning: 'mistral',
      lightweight: 'phi3',
      multilingual: 'llama3:8b-text-chkpt-q5_K_M'
    };
  }
}

module.exports = ModelManager;