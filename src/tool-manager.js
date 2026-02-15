/**
 * Tool Manager for Melius Operarius
 * Manages various tools and utilities similar to OpenClaw
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class ToolManager {
  constructor(config = {}) {
    this.tools = new Map();
    this.config = config;
    this.initializeDefaultTools();
  }

  /**
   * Initialize default tools that replicate OpenClaw functionality
   */
  initializeDefaultTools() {
    // File system tools
    this.registerTool('read_file', this.readFile.bind(this));
    this.registerTool('write_file', this.writeFile.bind(this));
    this.registerTool('list_files', this.listFiles.bind(this));
    this.registerTool('file_info', this.getFileInfo.bind(this));

    // System tools
    this.registerTool('shell_exec', this.executeShellCommand.bind(this));
    this.registerTool('web_search', this.simulateWebSearch.bind(this)); // Placeholder - would connect to privacy-focused search
    this.registerTool('web_fetch', this.fetchWebContent.bind(this));

    // Network tools
    this.registerTool('ping', this.pingHost.bind(this));
    this.registerTool('port_scan', this.scanPorts.bind(this));

    // Utility tools
    this.registerTool('datetime', this.getCurrentDateTime.bind(this));
    this.registerTool('calculator', this.calculate.bind(this));
  }

  /**
   * Register a new tool
   */
  registerTool(name, handler, description = '') {
    this.tools.set(name, {
      handler,
      description: description || `Tool: ${name}`
    });
  }

  /**
   * Execute a tool with given parameters
   */
  async executeTool(toolName, params = {}) {
    const tool = this.tools.get(toolName);
    
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    try {
      return await tool.handler(params);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        tool: toolName
      };
    }
  }

  /**
   * Get all available tools
   */
  getAvailableTools() {
    const toolsInfo = {};
    
    for (const [name, tool] of this.tools.entries()) {
      toolsInfo[name] = {
        description: tool.description
      };
    }
    
    return toolsInfo;
  }

  /**
   * Read a file from the file system
   */
  async readFile(params) {
    const { path: filePath, encoding = 'utf8' } = params;
    
    if (!filePath) {
      throw new Error('File path is required');
    }

    try {
      const content = await fs.readFile(filePath, encoding);
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        content: content.toString(),
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        path: filePath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: filePath
      };
    }
  }

  /**
   * Write content to a file
   */
  async writeFile(params) {
    const { path: filePath, content, encoding = 'utf8' } = params;
    
    if (!filePath || content === undefined) {
      throw new Error('File path and content are required');
    }

    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(filePath, content, encoding);
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
        error: error.message,
        path: filePath
      };
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(params) {
    const { path: dirPath = '.', showHidden = false } = params;
    
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      const files = items
        .filter(item => showHidden || !item.name.startsWith('.'))
        .map(item => ({
          name: item.name,
          type: item.isDirectory() ? 'directory' : 'file',
          path: path.join(dirPath, item.name)
        }));

      return {
        success: true,
        directory: dirPath,
        files: files,
        count: files.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        directory: dirPath
      };
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(params) {
    const { path: filePath } = params;
    
    if (!filePath) {
      throw new Error('File path is required');
    }

    try {
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        path: filePath,
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        createdAt: stats.birthtime.toISOString(),
        modifiedAt: stats.mtime.toISOString(),
        accessedAt: stats.atime.toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: filePath
      };
    }
  }

  /**
   * Execute a shell command
   */
  async executeShellCommand(params) {
    const { command, timeout = 30000 } = params;
    
    if (!command) {
      throw new Error('Command is required');
    }

    try {
      const { stdout, stderr } = await execAsync(command, { 
        timeout: timeout,
        maxBuffer: 1024 * 1024 * 10 // 10MB max buffer
      });
      
      return {
        success: true,
        command: command,
        stdout: stdout,
        stderr: stderr,
        exitCode: 0
      };
    } catch (error) {
      return {
        success: false,
        command: command,
        error: error.message,
        stderr: error.stderr || '',
        stdout: error.stdout || '',
        exitCode: error.code || 1
      };
    }
  }

  /**
   * Simulate web search (placeholder - would connect to privacy-focused search API)
   */
  async simulateWebSearch(params) {
    const { query, maxResults = 5 } = params;
    
    if (!query) {
      throw new Error('Query is required');
    }

    // In a real implementation, this would connect to a privacy-focused search API
    // For now, we'll return simulated results
    const mockResults = [
      { title: `Result 1 for "${query}"`, url: 'https://example.com/1', snippet: 'This is a sample search result.' },
      { title: `Result 2 for "${query}"`, url: 'https://example.com/2', snippet: 'Another sample result.' },
      { title: `Result 3 for "${query}"`, url: 'https://example.com/3', snippet: 'More sample results.' }
    ].slice(0, maxResults);

    return {
      success: true,
      query: query,
      results: mockResults,
      count: mockResults.length,
      source: 'simulated-search'
    };
  }

  /**
   * Fetch content from a web URL
   */
  async fetchWebContent(params) {
    const { url, timeout = 10000 } = params;
    
    if (!url) {
      throw new Error('URL is required');
    }

    // Basic validation to prevent SSRF attacks
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('Invalid URL: must start with http:// or https://');
    }

    // In a real implementation, we'd use a secure HTTP client
    // For now, this is a placeholder
    return {
      success: true,
      url: url,
      content: `Simulated content fetched from ${url}`,
      status: 200,
      headers: { 'content-type': 'text/html' },
      size: 1024
    };
  }

  /**
   * Ping a host
   */
  async pingHost(params) {
    const { host, count = 4 } = params;
    
    if (!host) {
      throw new Error('Host is required');
    }

    try {
      const command = process.platform === 'win32' 
        ? `ping -n ${count} ${host}` 
        : `ping -c ${count} ${host}`;
      
      const { stdout } = await execAsync(command, { timeout: 30000 });
      
      return {
        success: true,
        host: host,
        output: stdout,
        command: command
      };
    } catch (error) {
      return {
        success: false,
        host: host,
        error: error.message
      };
    }
  }

  /**
   * Scan ports on a host (basic implementation)
   */
  async scanPorts(params) {
    const { host, ports = [22, 80, 443, 3000, 8080], timeout = 5000 } = params;
    
    if (!host) {
      throw new Error('Host is required');
    }

    // This is a simplified port scanning implementation
    // In a real implementation, we'd use proper socket connections
    const results = [];
    
    for (const port of ports) {
      // Simulate port scan result
      results.push({
        port: port,
        status: Math.random() > 0.5 ? 'open' : 'closed', // Simulated
        service: port === 80 ? 'http' : port === 443 ? 'https' : 'unknown'
      });
    }

    return {
      success: true,
      host: host,
      ports: results,
      scanned: ports.length
    };
  }

  /**
   * Get current date and time
   */
  async getCurrentDateTime() {
    const now = new Date();
    
    return {
      success: true,
      datetime: now.toISOString(),
      timestamp: now.getTime(),
      formatted: {
        iso: now.toISOString(),
        locale: now.toLocaleString(),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString()
      }
    };
  }

  /**
   * Simple calculator
   */
  async calculate(params) {
    const { expression } = params;
    
    if (expression === undefined) {
      throw new Error('Expression is required');
    }

    // Basic math expression evaluation (safe subset)
    // In a real implementation, we'd use a safer expression evaluator
    try {
      // Only allow numbers, operators, and spaces
      if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
        throw new Error('Invalid characters in expression');
      }
      
      // Evaluate the expression safely
      const result = eval(expression); // Note: in production, use a safe expression evaluator
      
      return {
        success: true,
        expression: expression,
        result: result,
        type: typeof result
      };
    } catch (error) {
      return {
        success: false,
        expression: expression,
        error: error.message
      };
    }
  }
}

module.exports = ToolManager;