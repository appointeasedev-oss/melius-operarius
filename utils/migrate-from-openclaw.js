/**
 * Migration utility to help users transition from OpenClaw to Melius Operarius
 * This tool helps transfer configurations and settings from OpenClaw
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const Configstore = require('configstore');

class OpenClawMigration {
  constructor() {
    this.openclawConfigPath = this.findOpenClawConfig();
    this.meliusConfig = new Configstore('melius-operarius');
  }

  /**
   * Find OpenClaw configuration if it exists
   */
  findOpenClawConfig() {
    // Common OpenClaw config locations
    const possiblePaths = [
      path.join(os.homedir(), '.openclaw', 'config.json'),
      path.join(os.homedir(), '.config', 'openclaw', 'config.json'),
      path.join(process.cwd(), 'openclaw-config.json'),
    ];
    
    for (const configPath of possiblePaths) {
      try {
        fs.accessSync(configPath);
        return configPath;
      } catch (error) {
        // File doesn't exist, try the next path
      }
    }
    
    return null;
  }

  /**
   * Check if OpenClaw configuration exists
   */
  isOpenClawInstalled() {
    return this.openclawConfigPath !== null;
  }

  /**
   * Migrate OpenClaw settings to Melius Operarius
   */
  async migrate() {
    if (!this.isOpenClawInstalled()) {
      console.log('No OpenClaw installation found. Nothing to migrate.');
      return false;
    }

    console.log('🔍 Found OpenClaw installation. Starting migration...');
    
    try {
      // Read OpenClaw configuration
      const openclawConfigData = await fs.readFile(this.openclawConfigPath, 'utf8');
      const openclawConfig = JSON.parse(openclawConfigData);
      
      console.log('📋 OpenClaw configuration loaded');
      
      // Map OpenClaw settings to Melius Operarius equivalents
      const migratedSettings = this.mapSettings(openclawConfig);
      
      // Apply settings to Melius Operarius
      this.applyMigratedSettings(migratedSettings);
      
      console.log('✅ Migration completed successfully!');
      console.log('');
      console.log('Migrated settings:');
      console.log(`  - Server port: ${migratedSettings.serverPort}`);
      console.log(`  - Default model: ${migratedSettings.defaultModel}`);
      console.log(`  - Ollama host: ${migratedSettings.ollamaHost}`);
      if (migratedSettings.plugins) {
        console.log(`  - Enabled plugins: ${migratedSettings.plugins.length}`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      return false;
    }
  }

  /**
   * Map OpenClaw settings to Melius Operarius equivalents
   */
  mapSettings(openclawConfig) {
    const mapped = {
      serverPort: 3000, // Default, may be overridden
      defaultModel: 'llama3', // Default, may be overridden
      ollamaHost: 'http://localhost:11434', // Default for Melius Operarius
      plugins: []
    };
    
    // Map server settings
    if (openclawConfig.server && openclawConfig.server.port) {
      mapped.serverPort = openclawConfig.server.port;
    }
    
    // Map model settings
    if (openclawConfig.model && openclawConfig.model.default) {
      mapped.defaultModel = openclawConfig.model.default;
    } else if (openclawConfig.agent && openclawConfig.agent.model) {
      mapped.defaultModel = openclawConfig.agent.model;
    }
    
    // Map external API settings to local Ollama equivalent
    // In Melius Operarius, we always use local Ollama
    mapped.ollamaHost = 'http://localhost:11434';
    
    // Map plugin settings
    if (openclawConfig.plugins && Array.isArray(openclawConfig.plugins.enabled)) {
      mapped.plugins = [...openclawConfig.plugins.enabled];
    } else if (openclawConfig.modules && Array.isArray(openclawConfig.modules)) {
      mapped.plugins = [...openclawConfig.modules];
    }
    
    // Map any other relevant settings
    if (openclawConfig.logging && openclawConfig.logging.level) {
      mapped.logLevel = openclawConfig.logging.level;
    }
    
    return mapped;
  }

  /**
   * Apply migrated settings to Melius Operarius configuration
   */
  applyMigratedSettings(settings) {
    // Apply each setting to the Melius Operarius config
    this.meliusConfig.set('setupComplete', true);
    this.meliusConfig.set('ollamaHost', settings.ollamaHost);
    this.meliusConfig.set('defaultModel', settings.defaultModel);
    this.meliusConfig.set('serverPort', settings.serverPort);
    
    if (settings.logLevel) {
      this.meliusConfig.set('logLevel', settings.logLevel);
    }
    
    // For plugins, we'll store the list but they'll need to be compatible with MP format
    if (settings.plugins && Array.isArray(settings.plugins)) {
      this.meliusConfig.set('migratedPlugins', settings.plugins);
      console.log(`\n⚠️  Note: ${settings.plugins.length} plugins were identified from OpenClaw.`);
      console.log('   These will need to be reimplemented as Melius Operarius plugins.');
    }
  }

  /**
   * Show migration report
   */
  getMigrationReport() {
    if (!this.isOpenClawInstalled()) {
      return {
        status: 'no-openclaw',
        message: 'No OpenClaw installation found'
      };
    }

    return {
      status: 'found',
      openclawConfigPath: this.openclawConfigPath,
      meliusConfigPath: path.join(os.homedir(), '.config', 'melius-operarius'),
      canMigrate: true
    };
  }
}

// If run directly from command line
if (require.main === module) {
  const migration = new OpenClawMigration();
  
  if (migration.isOpenClawInstalled()) {
    console.log('🔄 OpenClaw to Melius Operarius Migration Tool');
    console.log('');
    
    const report = migration.getMigrationReport();
    console.log(`OpenClaw config found at: ${report.openclawConfigPath}`);
    console.log(`Melius Operarius config will be saved to: ${report.meliusConfigPath}`);
    console.log('');
    
    const confirm = process.argv.includes('--force') || 
                   confirm('Would you like to proceed with migration? (Use --force to skip confirmation)');
    
    if (confirm || process.argv.includes('--force')) {
      migration.migrate().then(success => {
        if (success) {
          console.log('');
          console.log('Migration complete! You can now start Melius Operarius:');
          console.log('  npx melius-operarius start');
        }
      }).catch(console.error);
    } else {
      console.log('Migration cancelled.');
    }
  } else {
    console.log('No OpenClaw installation found. Nothing to migrate.');
  }
}

module.exports = OpenClawMigration;