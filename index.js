#!/usr/bin/env node

/**
 * Melius Operarius
 * An open-source AI agent using local Ollama models
 * Created by Aras
 * 
 * Command-line interface for the Melius Operarius AI agent
 * Can be installed globally with: npm install -g melius-operarius
 */

const program = require('commander');
const MeliusController = require('./src/controller');

program
  .name('melius-operarius')
  .description('CLI for Melius Operarius - local AI agent')
  .version('0.1.0');

program
  .command('start')
  .description('Start the Melius Operarius service')
  .action(async () => {
    console.log('Starting Melius Operarius service...');
    
    const controller = new MeliusController();
    
    try {
      await controller.initialize();
      await controller.startServer();
    } catch (error) {
      console.error('Failed to start Melius Operarius:', error);
      process.exit(1);
    }
  });

program
  .command('setup')
  .description('Setup Ollama and initial configuration')
  .action(async () => {
    console.log('Setting up Melius Operarius...');
    
    const controller = new MeliusController();
    await controller.initializeComponents(); // Initialize components first
    
    const config = controller.config;
    
    // Check if Ollama is available
    try {
      await controller.modelManager.listModels();
      console.log('✓ Ollama is available');
    } catch (error) {
      console.log('⚠ Could not connect to Ollama:', error.message);
      console.log('Please ensure Ollama is installed and running at http://localhost:11434');
      return;
    }
    
    // Store initial configuration
    await config.set('setupComplete', true);
    await config.set('ollamaHost', 'http://localhost:11434');
    console.log('✓ Configuration saved');
  });

program
  .command('models')
  .description('List available models')
  .action(async () => {
    console.log('Listing available models...');
    
    const controller = new MeliusController();
    await controller.initializeComponents(); // Initialize components first
    
    try {
      const models = await controller.modelManager.listModels();
      if (models.length === 0) {
        console.log('No models found. Run "ollama pull <model>" to download a model.');
      } else {
        console.log(`Found ${models.length} model(s):`);
        models.forEach(model => {
          console.log(`- ${model.name} (${Math.round(model.size / 1024 / 1024)} MB)`);
        });
      }
    } catch (error) {
      console.error('Error listing models:', error.message);
    }
  });

program
  .command('chat')
  .description('Start an interactive chat session')
  .option('-m, --model <model>', 'Model to use', 'llama3')
  .action(async (options) => {
    const readline = require('readline');
    const controller = new MeliusController();
    
    // Initialize components
    await controller.initializeComponents();
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log(`Chatting with ${options.model} model. Type 'exit' to quit.\n`);
    
    const history = [];
    
    const chatLoop = async () => {
      rl.question('You: ', async (input) => {
        if (input.toLowerCase() === 'exit') {
          console.log('Goodbye!');
          rl.close();
          return;
        }
        
        try {
          const result = await controller.modelManager.generateResponse([
            ...history,
            { role: 'user', content: input }
          ], { model: options.model });
          
          if (result.success) {
            console.log(`Assistant: ${result.response}\n`);
            
            // Update history
            history.push(
              { role: 'user', content: input },
              { role: 'assistant', content: result.response }
            );
            
            // Limit history to prevent context overflow
            if (history.length > 20) {
              history.splice(0, 5); // Remove oldest 5 exchanges
            }
          } else {
            console.error('Error:', result.error);
          }
        } catch (error) {
          console.error('Error:', error.message);
        }
        
        chatLoop(); // Continue the loop
      });
    };
    
    chatLoop();
  });

program
  .command('setup-wizard')
  .description('Interactive setup wizard')
  .action(async () => {
    const SetupAssistant = require('./scripts/setup-assistant');
    const assistant = new SetupAssistant();
    await assistant.start();
  });

program
  .command('migrate-from-openclaw')
  .description('Migrate settings from OpenClaw to Melius Operarius')
  .option('-f, --force', 'Skip confirmation prompts')
  .action(async (options) => {
    const OpenClawMigration = require('./utils/migrate-from-openclaw');
    const migration = new OpenClawMigration();
    
    if (migration.isOpenClawInstalled()) {
      console.log('🔄 OpenClaw to Melius Operarius Migration Tool\n');
      
      const report = migration.getMigrationReport();
      console.log(`OpenClaw config found at: ${report.openclawConfigPath}`);
      console.log(`Melius Operarius config will be saved to: ${report.meliusConfigPath}\n`);
      
      if (options.force) {
        await migration.migrate();
      } else {
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise(resolve => {
          rl.question('Would you like to proceed with migration? (yes/no): ', (input) => {
            rl.close();
            resolve(input.toLowerCase().startsWith('y'));
          });
        });
        
        if (answer) {
          await migration.migrate();
        } else {
          console.log('Migration cancelled.');
        }
      }
    } else {
      console.log('No OpenClaw installation found. Nothing to migrate.');
    }
  });

program.parse();