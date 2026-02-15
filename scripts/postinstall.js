#!/usr/bin/env node

/**
 * Post-install script for Melius Operarius
 * Runs after npm install to provide helpful next steps
 */

const chalk = require('chalk'); // Would need to be added to dependencies in real implementation
const fs = require('fs').promises;
const path = require('path');

async function runPostInstall() {
  console.log('\n🤖 Thank you for installing Melius Operarius!');
  console.log('');
  console.log('Melius Operarius is an open-source AI agent that runs on local Ollama models');
  console.log('instead of external APIs, ensuring your privacy and data control.');
  console.log('');

  // Check if this is the first run
  const configDir = path.join(require('os').homedir(), '.config', 'melius-operarius');
  let isFirstRun = true;
  
  try {
    await fs.access(configDir);
    isFirstRun = false;
  } catch (error) {
    // Config directory doesn't exist, so it's first run
    isFirstRun = true;
  }

  if (isFirstRun) {
    console.log('✨ This appears to be your first time using Melius Operarius!');
    console.log('');
    console.log(chalk.blue('To get started, run one of these commands:'));
    console.log('');
    console.log('  npx melius-operarius setup-wizard    # Interactive setup assistant');
    console.log('  npx melius-operarius setup          # Basic setup');
    console.log('');
    console.log(chalk.green('Need help? Visit our documentation at: https://github.com/appointeasedev-oss/melius-operarius'));
    console.log('');
  } else {
    console.log(chalk.yellow('Ready to use Melius Operarius!'));
    console.log('');
    console.log('Commands you can run:');
    console.log('');
    console.log('  npx melius-operarius start          # Start the service');
    console.log('  npx melius-operarius chat           # Interactive chat session');
    console.log('  npx melius-operarius models         # List available models');
    console.log('');
  }

  console.log(chalk.cyan('💡 Pro tip: Melius Operarius keeps all your data local - no external APIs!'));
  console.log('');
}

// Try to run the post-install script, but don't crash if chalk isn't available
try {
  runPostInstall().catch(console.error);
} catch (error) {
  // Fallback without chalk colors
  console.log('\n🤖 Thank you for installing Melius Operarius!');
  console.log('');
  console.log('This is an open-source AI agent that runs on local Ollama models');
  console.log('instead of external APIs, ensuring your privacy and data control.');
  console.log('');
  console.log('To get started, run:');
  console.log('');
  console.log('  npx melius-operarius setup-wizard    # Interactive setup assistant');
  console.log('  npx melius-operarius start           # Start the service');
  console.log('');
  console.log('Visit https://github.com/appointeasedev-oss/melius-operarius for documentation');
  console.log('');
}