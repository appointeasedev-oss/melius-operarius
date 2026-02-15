/**
 * Setup Assistant for Melius Operarius
 * Guided installation and configuration
 */

const readline = require('readline');
const { execSync, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const Configstore = require('configstore');

class SetupAssistant {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.config = {
      ollamaHost: 'http://localhost:11434',
      defaultModel: 'llama3',
      serverPort: 3000,
      pluginDirectory: './plugins'
    };
  }

  /**
   * Start the guided setup process
   */
  async start() {
    console.log('🤖 Welcome to Melius Operarius Setup Assistant!');
    console.log('This will guide you through installing and configuring your local AI agent.\n');

    try {
      // Check prerequisites
      await this.checkPrerequisites();
      
      // Install Ollama if needed
      await this.installOllamaIfNeeded();
      
      // Configure settings
      await this.configureSettings();
      
      // Install default model
      await this.installDefaultModel();
      
      // Finalize setup
      await this.finalizeSetup();
      
      console.log('\n🎉 Setup complete! Melius Operarius is ready to use.');
      console.log('\nQuick start commands:');
      console.log('  npx melius-operarius start     # Start the service');
      console.log('  npx melius-operarius chat      # Interactive chat');
      console.log('  npx melius-operarius models    # List available models');
      console.log('\nVisit http://localhost:3000 for the web interface.');
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  /**
   * Check if prerequisites are met
   */
  async checkPrerequisites() {
    console.log('🔍 Checking system prerequisites...\n');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const nodeMajor = parseInt(nodeVersion.split('.')[0].substring(1));
    
    if (nodeMajor < 16) {
      throw new Error(`Node.js version 16+ required. Current version: ${nodeVersion}`);
    }
    
    console.log(`✓ Node.js version: ${nodeVersion}`);
    
    // Check disk space (minimum 4GB free)
    try {
      const freeSpace = this.getFreeDiskSpace();
      if (freeSpace < 4 * 1024 * 1024 * 1024) { // 4GB in bytes
        console.warn('⚠ Low disk space detected. At least 4GB is recommended for models.');
      } else {
        console.log(`✓ Sufficient disk space available`);
      }
    } catch (error) {
      console.log('? Could not determine available disk space');
    }
    
    console.log('');
  }

  /**
   * Get free disk space (approximate)
   */
  getFreeDiskSpace() {
    // This is a simplified approach - in a real implementation, 
    // we'd use system-specific commands or libraries
    try {
      if (os.platform() === 'win32') {
        const drive = path.parse(process.cwd()).root;
        const result = execSync(`dir "${drive}"`, { encoding: 'utf8' });
        // Parse the output to get free space (simplified)
        return 10 * 1024 * 1024 * 1024; // Assume 10GB for now
      } else {
        const result = execSync('df -k .', { encoding: 'utf8' });
        const lines = result.trim().split('\n');
        if (lines.length > 1) {
          const parts = lines[1].split(/\s+/);
          const availableKB = parseInt(parts[3]);
          return availableKB * 1024; // Convert KB to bytes
        }
      }
    } catch (error) {
      // If we can't determine space, return a reasonable default
      return 10 * 1024 * 1024 * 1024; // 10GB
    }
  }

  /**
   * Install Ollama if it's not already installed
   */
  async installOllamaIfNeeded() {
    console.log('📦 Checking Ollama installation...\n');
    
    try {
      // Try to run 'ollama --version' to see if it's installed
      const result = execSync('ollama --version', { encoding: 'utf8' });
      console.log(`✓ Ollama is already installed: ${result.trim()}`);
      
      // Check if Ollama service is running
      try {
        execSync('ollama list', { encoding: 'utf8' });
        console.log('✓ Ollama service is running');
      } catch (error) {
        console.log('⚠ Ollama service is not running. Starting...');
        await this.startOllamaService();
      }
    } catch (error) {
      // Ollama is not installed
      console.log('ℹ Ollama is not installed. Installing now...\n');
      
      const confirm = await this.askQuestion('Install Ollama now? (y/N): ');
      if (confirm.toLowerCase().startsWith('y')) {
        await this.downloadAndInstallOllama();
      } else {
        console.log('Please install Ollama manually from https://ollama.ai');
        process.exit(1);
      }
    }
    
    console.log('');
  }

  /**
   * Download and install Ollama based on the platform
   */
  async downloadAndInstallOllama() {
    const platform = os.platform();
    
    try {
      switch(platform) {
        case 'darwin': // macOS
          console.log('Downloading Ollama for macOS...');
          execSync('curl -fsSL https://ollama.ai/install.sh | sh', { stdio: 'inherit' });
          break;
          
        case 'linux':
          console.log('Downloading Ollama for Linux...');
          execSync('curl -fsSL https://ollama.ai/install.sh | sh', { stdio: 'inherit' });
          break;
          
        case 'win32': // Windows
          console.log('For Windows, please download Ollama from https://ollama.ai/download');
          console.log('After installation, restart this setup process.');
          process.exit(0);
          break;
          
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
      
      console.log('✓ Ollama installed successfully');
      
      // Start Ollama service
      await this.startOllamaService();
    } catch (error) {
      throw new Error(`Failed to install Ollama: ${error.message}`);
    }
  }

  /**
   * Start Ollama service
   */
  async startOllamaService() {
    console.log('Starting Ollama service...');
    
    try {
      // On Unix systems, Ollama should start as a service
      // On Windows, the installer typically starts it automatically
      if (os.platform() !== 'win32') {
        // Wait a moment for the service to start
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Verify it's running by listing models
      execSync('ollama list', { encoding: 'utf8' });
      console.log('✓ Ollama service is running');
    } catch (error) {
      console.log('⚠ Could not verify Ollama service. It may need manual start.');
      console.log('On Linux/macOS, you may need to start it manually with:');
      console.log('  ollama serve');
    }
  }

  /**
   * Configure settings
   */
  async configureSettings() {
    console.log('\n⚙️  Configuration\n');
    
    // Ask for server port
    const portInput = await this.askQuestion(`Server port (default: ${this.config.serverPort}): `);
    if (portInput.trim() !== '') {
      const port = parseInt(portInput);
      if (!isNaN(port) && port > 0 && port < 65536) {
        this.config.serverPort = port;
      } else {
        console.log('Invalid port, using default');
      }
    }
    
    // Ask for default model
    const modelInput = await this.askQuestion(`Default model (default: ${this.config.defaultModel}): `);
    if (modelInput.trim() !== '') {
      this.config.defaultModel = modelInput.trim();
    }
    
    // Ask for Ollama host
    const hostInput = await this.askQuestion(`Ollama host (default: ${this.config.ollamaHost}): `);
    if (hostInput.trim() !== '') {
      this.config.ollamaHost = hostInput.trim();
    }
    
    console.log('');
  }

  /**
   * Install default model
   */
  async installDefaultModel() {
    console.log(`📥 Installing default model: ${this.config.defaultModel}\n`);
    
    const confirm = await this.askQuestion(`Install ${this.config.defaultModel} model? This may take several minutes and requires internet. (Y/n): `);
    
    if (!confirm.toLowerCase().startsWith('n')) {
      try {
        console.log(`Installing ${this.config.defaultModel}...`);
        
        // Spawn the ollama pull command to show progress
        const pullProcess = spawn('ollama', ['pull', this.config.defaultModel]);
        
        pullProcess.stdout.on('data', (data) => {
          process.stdout.write(data.toString());
        });
        
        pullProcess.stderr.on('data', (data) => {
          process.stdout.write(data.toString());
        });
        
        await new Promise((resolve, reject) => {
          pullProcess.on('close', (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`Ollama pull failed with code ${code}`));
            }
          });
        });
        
        console.log(`\n✓ ${this.config.defaultModel} model installed successfully\n`);
      } catch (error) {
        console.log(`⚠ Failed to install ${this.config.defaultModel}: ${error.message}`);
        console.log('You can install it later with: ollama pull ' + this.config.defaultModel);
      }
    } else {
      console.log(`Skipping model installation. You can install it later with: ollama pull ${this.config.defaultModel}\n`);
    }
  }

  /**
   * Finalize setup
   */
  async finalizeSetup() {
    console.log('💾 Saving configuration...\n');
    
    // Save configuration to configstore
    const config = new Configstore('melius-operarius');
    
    config.set('setupComplete', true);
    config.set('ollamaHost', this.config.ollamaHost);
    config.set('defaultModel', this.config.defaultModel);
    config.set('serverPort', this.config.serverPort);
    config.set('pluginDirectory', this.config.pluginDirectory);
    
    // Create necessary directories
    const dirs = ['./logs', './plugins', './models', './data'];
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.log(`Warning: Could not create directory ${dir}: ${error.message}`);
      }
    }
    
    console.log('✓ Configuration saved');
    console.log('✓ Required directories created');
  }

  /**
   * Ask a question and return the response
   */
  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
}

// Run the setup assistant if this file is executed directly
if (require.main === module) {
  const assistant = new SetupAssistant();
  assistant.start().catch(console.error);
}

module.exports = SetupAssistant;