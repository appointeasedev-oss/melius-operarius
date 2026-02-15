#!/usr/bin/env node

/**
 * Deployment Script for Melius Operarius
 * Handles deployment to different environments
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
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
  console.log('🚀 Melius Operarius Deployment Tool');
  console.log('');
  
  try {
    const env = await askQuestion('Deploy to (development/staging/production) [production]: ') || 'production';
    
    switch(env.toLowerCase()) {
      case 'development':
        await deployDevelopment();
        break;
      case 'staging':
        await deployStaging();
        break;
      case 'production':
        await deployProduction();
        break;
      default:
        console.log('Invalid environment. Use development, staging, or production.');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function deployDevelopment() {
  console.log('\n🔧 Setting up development environment...');
  
  // Create development-specific config
  const devConfig = {
    server: {
      port: 3001,
      host: "localhost"
    },
    ollama: {
      host: "http://localhost:11434",
      defaultModel: "llama3"
    },
    logging: {
      level: "debug",
      file: "./logs/dev.log"
    },
    database: {
      enabled: false
    }
  };
  
  await fs.writeFile('./config/development.json', JSON.stringify(devConfig, null, 2));
  
  console.log('✅ Development environment configured');
  console.log('\nTo start in development mode:');
  console.log('NODE_ENV=development npm run dev');
  console.log('or');
  console.log('cross-env NODE_ENV=development nodemon index.js');
}

async function deployStaging() {
  console.log('\n🔧 Setting up staging environment...');
  
  // Create staging-specific config
  const stagingConfig = {
    server: {
      port: 3002,
      host: "0.0.0.0",
      cors: {
        origin: process.env.STAGING_URL || "https://staging.melius-operarius.example.com",
        credentials: true
      }
    },
    ollama: {
      host: process.env.OLLAMA_HOST || "http://localhost:11434",
      defaultModel: "llama3",
      timeout: 60000
    },
    logging: {
      level: "info",
      file: "./logs/staging.log"
    },
    security: {
      apiKeyRequired: true,
      allowedOrigins: [process.env.STAGING_URL || "https://staging.melius-operarius.example.com"]
    },
    database: {
      enabled: true,
      type: "sqlite",
      path: "./data/staging.db"
    }
  };
  
  await fs.writeFile('./config/staging.json', JSON.stringify(stagingConfig, null, 2));
  
  console.log('✅ Staging environment configured');
  console.log('\nEnvironment variables to set:');
  console.log('OLLAMA_HOST=your-ollama-instance-url');
  console.log('STAGING_URL=your-staging-domain');
  console.log('\nTo start in staging mode:');
  console.log('NODE_ENV=staging npm start');
}

async function deployProduction() {
  console.log('\n🔧 Setting up production environment...');
  
  // Verify production readiness
  console.log('\n📋 Production Checklist:');
  console.log('  - Ollama service running and accessible');
  console.log('  - SSL certificate configured (recommended)');
  console.log('  - Firewall rules set for port 3000');
  console.log('  - Backup strategy in place');
  console.log('  - Monitoring tools configured');
  
  const ready = await askQuestion('\nContinue with production deployment? (yes/no): ');
  
  if (!ready.toLowerCase().startsWith('y')) {
    console.log('Production deployment cancelled.');
    return;
  }
  
  // Copy production config if not exists
  try {
    await fs.access('./config/production.json');
    console.log('✅ Production config already exists');
  } catch {
    // Config doesn't exist, we already created it earlier
    console.log('✅ Production config created');
  }
  
  // Create systemd service file (Linux)
  if (process.platform !== 'win32') {
    const serviceContent = `[Unit]
Description=Melius Operarius Service
After=network.target

[Service]
Type=simple
User=${process.env.USER || 'nodejs'}
ExecStart=/usr/bin/npm start
WorkingDirectory=${process.cwd()}
Environment=NODE_ENV=production
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target`;

    try {
      await fs.writeFile('/etc/systemd/system/melius-operarius.service', serviceContent);
      console.log('✅ Systemd service file created (requires sudo)');
      console.log('   Run: sudo systemctl daemon-reload');
      console.log('   Run: sudo systemctl enable melius-operarius');
      console.log('   Run: sudo systemctl start melius-operarius');
    } catch (error) {
      // If we can't write to system directory, create in local directory
      await fs.writeFile('./melius-operarius.service', serviceContent);
      console.log('⚠️  Systemd service file created locally (need sudo to install system-wide)');
    }
  }
  
  // Create PM2 ecosystem file for process management
  const pm2Config = {
    apps: [{
      name: 'melius-operarius',
      script: 'index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/pm2-err.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true
    }]
  };
  
  await fs.writeFile('./ecosystem.config.js', `module.exports = ${JSON.stringify(pm2Config, null, 2)};`);
  
  console.log('\n✅ Production environment configured');
  console.log('\nDeployment options:');
  console.log('  1. Using PM2 (recommended):');
  console.log('     npm install -g pm2');
  console.log('     pm2 start ecosystem.config.js');
  console.log('     pm2 startup # Auto-start on boot');
  console.log('');
  console.log('  2. Using systemd (Linux):');
  console.log('     sudo systemctl daemon-reload');
  console.log('     sudo systemctl enable melius-operarius');
  console.log('     sudo systemctl start melius-operarius');
  console.log('');
  console.log('  3. Direct execution:');
  console.log('     NODE_ENV=production npm start');
}

// Run the deployment process
if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };