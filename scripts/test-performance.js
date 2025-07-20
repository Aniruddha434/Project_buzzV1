#!/usr/bin/env node

/**
 * Performance Testing Script for ProjectBuzz
 * Tests the implemented performance optimizations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PerformanceTester {
  constructor() {
    this.results = {
      imageOptimization: null,
      bundleOptimization: null,
      caching: null,
      database: null,
      overall: 'PASS'
    };
  }

  async runTests() {
    console.log('🧪 Running Performance Optimization Tests...\n');
    
    try {
      await this.testImageOptimization();
      await this.testBundleOptimization();
      await this.testCachingSetup();
      await this.testDatabaseOptimization();
      
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Performance tests failed:', error.message);
      this.results.overall = 'FAIL';
    }
  }

  async testImageOptimization() {
    console.log('🖼️  Testing Image Optimization...');
    
    const checks = {
      sharpInstalled: false,
      optimizationServiceExists: false,
      optimizedImageComponent: false,
      imageRoutesUpdated: false
    };

    try {
      // Check if Sharp is installed
      const backendPackageJson = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'backend', 'package.json'), 'utf8')
      );
      checks.sharpInstalled = !!backendPackageJson.dependencies.sharp;

      // Check if optimization service exists
      const optimizationServicePath = path.join(__dirname, '..', 'backend', 'services', 'imageOptimizationService.js');
      checks.optimizationServiceExists = fs.existsSync(optimizationServicePath);

      // Check if OptimizedImage component exists
      const optimizedImagePath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'OptimizedImage.tsx');
      checks.optimizedImageComponent = fs.existsSync(optimizedImagePath);

      // Check if project routes are updated
      const projectRoutesPath = path.join(__dirname, '..', 'backend', 'routes', 'projects.js');
      const projectRoutesContent = fs.readFileSync(projectRoutesPath, 'utf8');
      checks.imageRoutesUpdated = projectRoutesContent.includes('imageOptimizationService') && 
                                  projectRoutesContent.includes('/images/optimized/');

      this.results.imageOptimization = checks;
      
      const passed = Object.values(checks).every(check => check);
      console.log(`   ${passed ? '✅' : '❌'} Image Optimization: ${passed ? 'PASS' : 'FAIL'}`);
      
      Object.entries(checks).forEach(([key, value]) => {
        console.log(`     ${value ? '✅' : '❌'} ${key}: ${value ? 'OK' : 'MISSING'}`);
      });

    } catch (error) {
      console.error('   ❌ Image optimization test failed:', error.message);
      this.results.imageOptimization = { error: error.message };
    }
  }

  async testBundleOptimization() {
    console.log('\n📦 Testing Bundle Optimization...');
    
    const checks = {
      viteConfigOptimized: false,
      chunkSplittingConfigured: false,
      optimizeDepsUpdated: false,
      lazyLoadingImplemented: false
    };

    try {
      // Check Vite config
      const viteConfigPath = path.join(__dirname, '..', 'frontend', 'vite.config.ts');
      const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8');
      
      checks.viteConfigOptimized = viteConfigContent.includes('manualChunks') && 
                                   viteConfigContent.includes('rollupOptions');
      
      checks.chunkSplittingConfigured = viteConfigContent.includes('react-vendor') && 
                                        viteConfigContent.includes('ui-vendor');
      
      checks.optimizeDepsUpdated = viteConfigContent.includes('@radix-ui') && 
                                   viteConfigContent.includes('web-vitals');

      // Check lazy loading in App.tsx
      const appPath = path.join(__dirname, '..', 'frontend', 'src', 'App.tsx');
      const appContent = fs.readFileSync(appPath, 'utf8');
      checks.lazyLoadingImplemented = appContent.includes('lazy(') && 
                                      appContent.includes('Suspense');

      this.results.bundleOptimization = checks;
      
      const passed = Object.values(checks).every(check => check);
      console.log(`   ${passed ? '✅' : '❌'} Bundle Optimization: ${passed ? 'PASS' : 'FAIL'}`);
      
      Object.entries(checks).forEach(([key, value]) => {
        console.log(`     ${value ? '✅' : '❌'} ${key}: ${value ? 'OK' : 'MISSING'}`);
      });

    } catch (error) {
      console.error('   ❌ Bundle optimization test failed:', error.message);
      this.results.bundleOptimization = { error: error.message };
    }
  }

  async testCachingSetup() {
    console.log('\n📦 Testing Caching Setup...');
    
    const checks = {
      redisInstalled: false,
      cacheServiceExists: false,
      cacheMiddlewareExists: false,
      routesUpdated: false
    };

    try {
      // Check if Redis is installed
      const backendPackageJson = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'backend', 'package.json'), 'utf8')
      );
      checks.redisInstalled = !!backendPackageJson.dependencies.redis;

      // Check if cache service exists
      const cacheServicePath = path.join(__dirname, '..', 'backend', 'services', 'cacheService.js');
      checks.cacheServiceExists = fs.existsSync(cacheServicePath);

      // Check if cache middleware exists
      const cacheMiddlewarePath = path.join(__dirname, '..', 'backend', 'middleware', 'cache.js');
      checks.cacheMiddlewareExists = fs.existsSync(cacheMiddlewarePath);

      // Check if routes are updated with caching
      const projectRoutesPath = path.join(__dirname, '..', 'backend', 'routes', 'projects.js');
      const projectRoutesContent = fs.readFileSync(projectRoutesPath, 'utf8');
      checks.routesUpdated = projectRoutesContent.includes('projectCacheMiddleware') && 
                             projectRoutesContent.includes('invalidateCache');

      this.results.caching = checks;
      
      const passed = Object.values(checks).every(check => check);
      console.log(`   ${passed ? '✅' : '❌'} Caching Setup: ${passed ? 'PASS' : 'FAIL'}`);
      
      Object.entries(checks).forEach(([key, value]) => {
        console.log(`     ${value ? '✅' : '❌'} ${key}: ${value ? 'OK' : 'MISSING'}`);
      });

    } catch (error) {
      console.error('   ❌ Caching setup test failed:', error.message);
      this.results.caching = { error: error.message };
    }
  }

  async testDatabaseOptimization() {
    console.log('\n🗄️  Testing Database Optimization...');
    
    const checks = {
      optimizationServiceExists: false,
      projectModelIndexes: false,
      userModelIndexes: false,
      optimizationScriptExists: false
    };

    try {
      // Check if database optimization service exists
      const dbOptimizationPath = path.join(__dirname, '..', 'backend', 'services', 'databaseOptimizationService.js');
      checks.optimizationServiceExists = fs.existsSync(dbOptimizationPath);

      // Check Project model indexes
      const projectModelPath = path.join(__dirname, '..', 'backend', 'models', 'Project.js');
      const projectModelContent = fs.readFileSync(projectModelPath, 'utf8');
      checks.projectModelIndexes = projectModelContent.includes('projectSchema.index') && 
                                   projectModelContent.includes('text');

      // Check User model indexes
      const userModelPath = path.join(__dirname, '..', 'backend', 'models', 'User.js');
      if (fs.existsSync(userModelPath)) {
        const userModelContent = fs.readFileSync(userModelPath, 'utf8');
        checks.userModelIndexes = userModelContent.includes('userSchema.index') ||
                                  userModelContent.includes('role: 1') ||
                                  userModelContent.includes('unique: true');
      }

      // Check optimization script
      const optimizationScriptPath = path.join(__dirname, 'optimize-performance.js');
      checks.optimizationScriptExists = fs.existsSync(optimizationScriptPath);

      this.results.database = checks;
      
      const passed = Object.values(checks).every(check => check);
      console.log(`   ${passed ? '✅' : '❌'} Database Optimization: ${passed ? 'PASS' : 'FAIL'}`);
      
      Object.entries(checks).forEach(([key, value]) => {
        console.log(`     ${value ? '✅' : '❌'} ${key}: ${value ? 'OK' : 'MISSING'}`);
      });

    } catch (error) {
      console.error('   ❌ Database optimization test failed:', error.message);
      this.results.database = { error: error.message };
    }
  }

  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE OPTIMIZATION TEST RESULTS');
    console.log('='.repeat(60));
    
    const allPassed = Object.values(this.results).every(result => {
      if (typeof result === 'object' && result !== null) {
        return !result.error && Object.values(result).every(check => check === true);
      }
      return result === 'PASS';
    });

    console.log(`\n🎯 Overall Status: ${allPassed ? '✅ PASS' : '❌ FAIL'}`);
    
    console.log('\n📋 Summary:');
    console.log(`   🖼️  Image Optimization: ${this.getTestStatus(this.results.imageOptimization)}`);
    console.log(`   📦 Bundle Optimization: ${this.getTestStatus(this.results.bundleOptimization)}`);
    console.log(`   📦 Caching Setup: ${this.getTestStatus(this.results.caching)}`);
    console.log(`   🗄️  Database Optimization: ${this.getTestStatus(this.results.database)}`);
    
    console.log('\n💡 Next Steps:');
    if (allPassed) {
      console.log('   ✅ All optimizations are properly implemented!');
      console.log('   🚀 You can now run the application with improved performance');
      console.log('   📊 Monitor performance metrics in production');
    } else {
      console.log('   ⚠️  Some optimizations need attention');
      console.log('   🔧 Review the failed checks above');
      console.log('   📖 Refer to the implementation guide for fixes');
    }
    
    console.log('\n' + '='.repeat(60));
  }

  getTestStatus(result) {
    if (!result) return '❌ FAIL';
    if (result.error) return '❌ ERROR';
    
    const passed = Object.values(result).every(check => check === true);
    return passed ? '✅ PASS' : '❌ FAIL';
  }
}

// Run the tests
const tester = new PerformanceTester();
tester.runTests().catch(error => {
  console.error('💥 Fatal error:', error.message);
  process.exit(1);
});
