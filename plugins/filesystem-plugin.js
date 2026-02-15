/**
 * File System Plugin for Melius Operarius
 * Provides safe file system operations
 */

const fs = require('fs').promises;
const path = require('path');

class FileSystemPlugin {
  constructor(config) {
    this.name = 'File System Plugin';
    this.description = 'Provides safe file system operations with user permission';
    this.config = config || {
      allowedDirectories: ['./data', './uploads', './documents'],
      maxSizeMB: 10
    };
  }

  /**
   * Initialize the plugin
   */
  async initialize() {
    console.log(`${this.name} is initializing...`);
    
    // Ensure allowed directories exist
    for (const dir of this.config.allowedDirectories) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error.message);
      }
    }
    
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
   * Read a file
   */
  async readFile(filePath, options = {}) {
    // Validate that the file path is in an allowed directory
    if (!this.isPathAllowed(filePath)) {
      throw new Error(`Access denied: ${filePath} is not in allowed directories`);
    }
    
    try {
      const stats = await fs.stat(filePath);
      
      if (stats.size > (this.config.maxSizeMB * 1024 * 1024)) {
        throw new Error(`File too large: maximum size is ${this.config.maxSizeMB}MB`);
      }
      
      const content = await fs.readFile(filePath, options.encoding || 'utf8');
      
      return {
        success: true,
        path: filePath,
        content: content,
        size: stats.size,
        lastModified: stats.mtime.toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Write a file
   */
  async writeFile(filePath, content, options = {}) {
    // Validate that the file path is in an allowed directory
    if (!this.isPathAllowed(filePath)) {
      throw new Error(`Access denied: ${filePath} is not in allowed directories`);
    }
    
    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(filePath, content, options);
      
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        path: filePath,
        size: stats.size,
        message: 'File written successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(dirPath = '.', options = {}) {
    // Validate that the directory path is in allowed directories
    if (!this.isPathAllowed(dirPath)) {
      throw new Error(`Access denied: ${dirPath} is not in allowed directories`);
    }
    
    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true });
      
      const fileList = files
        .filter(dirent => !options.hideHidden || !dirent.name.startsWith('.'))
        .map(dirent => ({
          name: dirent.name,
          type: dirent.isDirectory() ? 'directory' : 'file',
          path: path.join(dirPath, dirent.name)
        }));
      
      return {
        success: true,
        directory: dirPath,
        files: fileList,
        count: fileList.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if a path is allowed
   */
  isPathAllowed(testPath) {
    // Normalize paths for comparison
    const normalizedTestPath = path.resolve(testPath);
    
    for (const allowedDir of this.config.allowedDirectories) {
      const normalizedAllowedDir = path.resolve(allowedDir);
      
      // Check if the test path starts with the allowed directory
      if (normalizedTestPath.startsWith(normalizedAllowedDir + path.sep) || 
          normalizedTestPath === normalizedAllowedDir) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get available methods
   */
  getAvailableMethods() {
    return [
      {
        name: 'readFile',
        description: 'Read a file from the file system',
        parameters: {
          filePath: {
            type: 'string',
            description: 'Path to the file to read',
            required: true
          },
          encoding: {
            type: 'string',
            description: 'File encoding (default: utf8)',
            required: false
          }
        }
      },
      {
        name: 'writeFile',
        description: 'Write content to a file',
        parameters: {
          filePath: {
            type: 'string',
            description: 'Path to the file to write',
            required: true
          },
          content: {
            type: 'string',
            description: 'Content to write to the file',
            required: true
          }
        }
      },
      {
        name: 'listFiles',
        description: 'List files in a directory',
        parameters: {
          dirPath: {
            type: 'string',
            description: 'Directory path to list (default: current directory)',
            required: false
          },
          hideHidden: {
            type: 'boolean',
            description: 'Whether to hide hidden files (default: false)',
            required: false
          }
        }
      }
    ];
  }

  /**
   * Register hooks with the plugin manager
   */
  async registerHooks(pluginManager) {
    // Example: register a hook for handling file-related queries
    pluginManager.registerHook('pre-chat-processing', async (data) => {
      if (data.message && 
          (data.message.toLowerCase().includes('file') || 
           data.message.toLowerCase().includes('read') ||
           data.message.toLowerCase().includes('write'))) {
        console.log('File system hook potentially triggered');
      }
      return data;
    });
  }

  /**
   * Called when the plugin is unloaded
   */
  async unload() {
    console.log(`${this.name} is unloading...`);
    return true;
  }
}

module.exports = FileSystemPlugin;