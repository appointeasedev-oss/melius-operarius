#!/usr/bin/env node

/**
 * One-Command Installation and Setup for Melius Operarius
 * Designed to make installation as simple as possible
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('🚀 Installing Melius Operarius - The Privacy-First AI Agent');
  console.log('');
  
  try {
    // Step 1: Check prerequisites
    console.log('🔍 Checking system requirements...');
    checkPrerequisites();
    console.log('✅ System requirements verified');
    
    // Step 2: Install Ollama if needed
    console.log('');
    const hasOllama = await checkOllama();
    if (!hasOllama) {
      console.log('📦 Ollama not found. Installing Ollama...');
      await installOllama();
      console.log('✅ Ollama installed');
    } else {
      console.log('✅ Ollama is already installed');
    }
    
    // Step 3: Check if Ollama service is running
    console.log('');
    const isOllamaRunning = await checkOllamaRunning();
    if (!isOllamaRunning) {
      console.log('🔧 Starting Ollama service...');
      await startOllamaService();
      // Wait a bit for the service to start
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('✅ Ollama service started');
    } else {
      console.log('✅ Ollama service is running');
    }
    
    // Step 4: Offer to install a default model
    console.log('');
    const installModel = await askQuestion('Would you like to install the default Llama 3 model now? This will take several minutes depending on your connection (Y/n): ');
    
    if (!installModel.toLowerCase().startsWith('n')) {
      console.log('📥 Installing Llama 3 model...');
      await installLlama3Model();
      console.log('✅ Llama 3 model installed');
    } else {
      console.log('ℹ️  You can install models later with: ollama pull <model-name>');
    }
    
    // Step 5: Run the setup wizard
    console.log('');
    console.log('⚙️  Running initial setup...');
    await runSetupWizard();
    console.log('✅ Initial setup completed');
    
    // Step 6: Show quick start instructions
    console.log('');
    console.log('🎉 Melius Operarius installation complete!');
    console.log('');
    console.log('Quick start commands:');
    console.log('  melius-operarius start    # Start the service');
    console.log('  melius-operarius chat     # Interactive chat session');
    console.log('  melius-operarius models   # List available models');
    console.log('');
    console.log('Visit http://localhost:3000/web for the web interface');
    console.log('');
    console.log('Need help? Run: npx melius-operarius --help');
  } catch (error) {
    console.error('❌ Installation failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

function checkPrerequisites() {
  // Check Node.js version
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.split('.')[0].substring(1));
  
  if (nodeMajor < 16) {
    throw new Error(`Node.js version 16+ required. Current version: ${nodeVersion}`);
  }
  
  console.log(`  Node.js version: ${nodeVersion}`);
}

async function checkOllama() {
  try {
    execSync('ollama --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

async function installOllama() {
  const platform = os.platform();
  
  try {
    switch(platform) {
      case 'darwin': // macOS
        execSync('curl -fsSL https://ollama.ai/install.sh | sh', { stdio: 'inherit' });
        break;
        
      case 'linux':
        execSync('curl -fsSL https://ollama.ai/install.sh | sh', { stdio: 'inherit' });
        break;
        
      case 'win32': // Windows
        console.log('For Windows, please download Ollama from https://ollama.ai/download');
        console.log('After installation, run this script again.');
        process.exit(0);
        break;
        
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  } catch (error) {
    throw new Error(`Failed to install Ollama: ${error.message}`);
  }
}

async function checkOllamaRunning() {
  try {
    execSync('ollama list', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

async function startOllamaService() {
  // For Unix systems, we'll try to start the service
  // On Windows, the installer typically starts it automatically
  if (os.platform() !== 'win32') {
    // Try to start ollama service in the background
    const ollamaProcess = spawn('ollama', ['serve'], {
      detached: true,
      stdio: 'ignore'
    });
    
    ollamaProcess.unref();
  }
}

async function installLlama3Model() {
  return new Promise((resolve, reject) => {
    const pullProcess = spawn('ollama', ['pull', 'llama3']);
    
    pullProcess.stdout.on('data', (data) => {
      process.stdout.write(data.toString());
    });
    
    pullProcess.stderr.on('data', (data) => {
      process.stdout.write(data.toString());
    });
    
    pullProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Failed to install llama3 model, exit code: ${code}`));
      }
    });
  });
}

async function runSetupWizard() {
  // Create a minimal setup by creating the config
  const Configstore = require('configstore');
  const config = new Configstore('melius-operarius');
  
  config.set('setupComplete', true);
  config.set('ollamaHost', 'http://localhost:11434');
  config.set('defaultModel', 'llama3');
  config.set('serverPort', 3000);
  config.set('pluginDirectory', './plugins');
  
  // Create necessary directories
  const dirs = ['./logs', './plugins', './models', './data'];
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Ignore errors if directories already exist
    }
  }
}

// Run the installation process
if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };