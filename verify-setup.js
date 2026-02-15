#!/usr/bin/env node

/**
 * Verification Script for Melius Operarius
 * Checks that all core components are properly set up
 */

console.log('🔍 Verifying Melius Operarius Setup...\n');

async function verifySetup() {
  try {
    // Test 1: Check if core modules can be loaded without errors
    console.log('1. Testing core module imports...');
    
    const { execSync } = require('child_process');
    const fs = require('fs').promises;
    const path = require('path');
    
    // Import core modules
    const Controller = require('./src/controller');
    const ConfigManager = require('./src/config-manager');
    const ModelManager = require('./src/model-manager');
    const PluginManager = require('./src/plugin-manager');
    const ToolManager = require('./src/tool-manager');
    const MonitoringService = require('./src/monitoring');
    
    console.log('   ✅ All core modules imported successfully');
    
    // Test 2: Test ConfigManager
    console.log('\n2. Testing configuration manager...');
    const config = new ConfigManager('melius-verifier');
    
    // Test basic config operations
    await config.set('test_key', 'test_value');
    const testValue = await config.get('test_key');
    
    if (testValue === 'test_value') {
      console.log('   ✅ Configuration manager working correctly');
    } else {
      console.log('   ❌ Configuration manager failed basic test');
      return false;
    }
    
    // Test 3: Test Controller initialization
    console.log('\n3. Testing controller initialization...');
    const controller = new Controller();
    
    // Initialize components
    await controller.initializeComponents();
    console.log('   ✅ Controller initialized successfully');
    
    // Test 4: Check if required directories exist
    console.log('\n4. Checking required directories...');
    const requiredDirs = ['./web', './plugins', './scripts', './src', './utils', './bin'];
    let allDirsExist = true;
    
    for (const dir of requiredDirs) {
      try {
        await fs.access(dir);
        console.log(`   ✅ Directory exists: ${dir}`);
      } catch (error) {
        console.log(`   ❌ Directory missing: ${dir}`);
        allDirsExist = false;
      }
    }
    
    if (!allDirsExist) {
      return false;
    }
    
    // Test 5: Check if required files exist
    console.log('\n5. Checking required files...');
    const requiredFiles = [
      './package.json',
      './index.js',
      './src/controller.js',
      './web/index.html',
      './scripts/setup-assistant.js'
    ];
    
    let allFilesExist = true;
    for (const file of requiredFiles) {
      try {
        await fs.access(file);
        console.log(`   ✅ File exists: ${file}`);
      } catch (error) {
        console.log(`   ❌ File missing: ${file}`);
        allFilesExist = false;
      }
    }
    
    if (!allFilesExist) {
      return false;
    }
    
    // Test 6: Check package.json structure
    console.log('\n6. Checking package.json...');
    const pkg = require('./package.json');
    const requiredFields = ['name', 'version', 'main', 'bin', 'scripts', 'dependencies'];
    
    let allFieldsPresent = true;
    for (const field of requiredFields) {
      if (pkg[field] === undefined) {
        console.log(`   ❌ Missing field in package.json: ${field}`);
        allFieldsPresent = false;
      }
    }
    
    if (allFieldsPresent) {
      console.log('   ✅ Package.json has all required fields');
    } else {
      return false;
    }
    
    // Test 7: Check if Ollama is available (optional)
    console.log('\n7. Checking Ollama availability (optional)...');
    try {
      execSync('ollama --version', { stdio: 'pipe' });
      console.log('   ✅ Ollama is available on the system');
    } catch (error) {
      console.log('   ⚠️  Ollama not found (this is okay - it can be installed separately)');
    }
    
    console.log('\n🎉 All verification tests passed!');
    console.log('\n📋 Summary:');
    console.log('   - Core modules load correctly');
    console.log('   - Configuration system works');
    console.log('   - All required files and directories present');
    console.log('   - Package structure is valid');
    console.log('   - Ready to run: npx melius-operarius setup-wizard');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    return false;
  }
}

// Run verification
verifySetup()
  .then(success => {
    if (success) {
      console.log('\n🚀 Melius Operarius is ready for use!');
      console.log('\nNext steps:');
      console.log('   1. Run: npx melius-operarius setup-wizard');
      console.log('   2. Or run: npm start');
      console.log('   3. Visit: http://localhost:3000/web');
    } else {
      console.log('\n❌ Issues were found. Please resolve them before using Melius Operarius.');
    }
  })
  .catch(error => {
    console.error('Unexpected error during verification:', error);
  });