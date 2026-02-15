/**
 * Installation script for Melius Operarius
 * Handles Ollama installation and initial setup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function installOllama() {
  console.log('Detecting operating system...');
  const platform = os.platform();
  
  try {
    switch(platform) {
      case 'darwin': // macOS
        console.log('Installing Ollama for macOS...');
        execSync('curl -fsSL https://ollama.ai/install.sh | sh', { stdio: 'inherit' });
        break;
        
      case 'linux':
        console.log('Installing Ollama for Linux...');
        execSync('curl -fsSL https://ollama.ai/install.sh | sh', { stdio: 'inherit' });
        break;
        
      case 'win32': // Windows
        console.log('For Windows, please download Ollama from https://ollama.ai');
        console.log('Then run this script again.');
        process.exit(1);
        break;
        
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    console.log('✓ Ollama installed successfully');
    return true;
  } catch (error) {
    console.error('✗ Failed to install Ollama:', error.message);
    return false;
  }
}

async function verifyOllama() {
  try {
    const { exec } = await import('child_process').then(m => m.default || m);
    
    // Try to run 'ollama list' to verify installation
    const result = execSync('ollama list', { encoding: 'utf8' });
    console.log('✓ Ollama is properly installed and running');
    console.log(result.stdout);
    return true;
  } catch (error) {
    console.error('✗ Ollama verification failed:', error.message);
    return false;
  }
}

async function setupConfiguration() {
  console.log('Setting up initial configuration...');
  
  // Create necessary directories
  const dirs = ['./logs', './plugins', './models'];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    }
  }
  
  // Copy default configuration if it doesn't exist
  const configDir = './config';
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  const defaultConfigPath = path.join(configDir, 'default.json');
  if (!fs.existsSync(defaultConfigPath)) {
    const defaultConfig = {
      server: {
        port: 3000,
        host: 'localhost'
      },
      ollama: {
        host: 'http://localhost:11434',
        defaultModel: 'llama3',
        timeout: 30000
      },
      logging: {
        level: 'info',
        file: './logs/app.log'
      },
      plugins: {
        enabled: [],
        directory: './plugins'
      }
    };
    
    fs.writeFileSync(defaultConfigPath, JSON.stringify(defaultConfig, null, 2));
    console.log('✓ Created default configuration');
  }
  
  return true;
}

async function installModel(modelName = 'llama3') {
  console.log(`Installing default model: ${modelName}...`);
  
  try {
    const { execSync } = await import('child_process').then(m => m.default || m);
    execSync(`ollama pull ${modelName}`, { stdio: 'inherit' });
    console.log(`✓ Model ${modelName} installed successfully`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to install model ${modelName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Installing Melius Operarius...\n');
  
  // Step 1: Install Ollama
  const ollamaInstalled = await installOllama();
  if (!ollamaInstalled) {
    console.log('\n❌ Installation failed during Ollama installation step.');
    process.exit(1);
  }
  
  // Step 2: Verify Ollama
  const ollamaVerified = await verifyOllama();
  if (!ollamaVerified) {
    console.log('\n❌ Installation failed during Ollama verification step.');
    process.exit(1);
  }
  
  // Step 3: Setup configuration
  const configSetup = await setupConfiguration();
  if (!configSetup) {
    console.log('\n❌ Installation failed during configuration setup.');
    process.exit(1);
  }
  
  // Step 4: Install default model
  const modelInstalled = await installModel();
  if (!modelInstalled) {
    console.log('\n⚠️  Warning: Could not install default model, but installation can continue.');
  }
  
  console.log('\n✅ Melius Operarius installation completed successfully!');
  console.log('\nTo get started:');
  console.log('1. Run `node index.js setup` to configure the application');
  console.log('2. Run `node index.js start` to start the service');
  console.log('3. Visit http://localhost:3000 to access the service');
}

if (require.main === module) {
  main().catch(error => {
    console.error('Installation failed with error:', error);
    process.exit(1);
  });
}

module.exports = {
  installOllama,
  verifyOllama,
  setupConfiguration,
  installModel
};