import { writeFileSync } from 'fs';

// StackBlitz ARM64 fix for Rollup
try {
  writeFileSync('node_modules/@rollup/rollup-linux-arm64-musl/package.json', '{"main":"index.js"}');
    console.log('Fixed Rollup ARM64');
    } catch (e) {
      console.log('Rollup fix skipped');
      }