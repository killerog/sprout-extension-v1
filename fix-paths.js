const fs = require('fs');
const path = require('path');

// Fix paths in index.html for browser extension compatibility
function fixPaths(buildPath) {
  const indexPath = path.join(buildPath, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.log(`No index.html found at ${indexPath}`);
    return;
  }
  
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Remove absolute paths and manifest link (not needed in extensions)
  html = html.replace(/href="\/manifest.json"/g, '');
  html = html.replace(/src="\//g, 'src="');
  html = html.replace(/href="\//g, 'href="');
  
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`Fixed paths in ${indexPath}`);
}

// Get build path from environment or use default
const buildPath = process.env.BUILD_PATH || process.argv[2] || './build/v3';

fixPaths(buildPath);
