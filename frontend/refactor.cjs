const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'services');
const files = fs.readdirSync(dir).filter(f => f !== 'api.js' && f.endsWith('.js'));
for (const file of files) {
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  
  // Replace import axios from 'axios' with api
  content = content.replace(/import axios from 'axios';/, "import api from './api';");
  
  // Replace API_URL interpolation with the explicit path
  const urlMatch = content.match(/const API_URL = 'http:\/\/localhost:3000\/api([^']*)';/);
  if (urlMatch) {
    const basePath = urlMatch[1]; // e.g. /buyer/orders
    content = content.replace(/\$\{API_URL\}/g, basePath);
    content = content.replace(/api\.get\(API_URL\)/g, "api.get('" + basePath + "')");
    content = content.replace(/api\.post\(API_URL/g, "api.post('" + basePath + "'");
    content = content.replace(/api\.put\(API_URL/g, "api.put('" + basePath + "'");
    content = content.replace(/api\.patch\(API_URL/g, "api.patch('" + basePath + "'");
    content = content.replace(/api\.delete\(API_URL/g, "api.delete('" + basePath + "'");
    content = content.replace(/\bAPI_URL\b/g, "'" + basePath + "'");
  }
  
  // Remove API_URL declaration
  content = content.replace(/const API_URL = 'http:\/\/localhost:3000\/api[^\']*';\r?\n\r?\n?/g, '');
  
  // Remove getHeaders function
  content = content.replace(/const getHeaders = \(\) => \{[\s\S]*?\};\r?\n\r?\n/g, '');
  content = content.replace(/const getHeaders = \(\) => \(\{[\s\S]*?\}\);\r?\n\r?\n/g, '');
  
  // Remove getHeaders() arguments
  content = content.replace(/, getHeaders\(\)/g, '');
  
  // Replace axios methods with api
  content = content.replace(/axios\.get/g, 'api.get');
  content = content.replace(/axios\.post/g, 'api.post');
  content = content.replace(/axios\.put/g, 'api.put');
  content = content.replace(/axios\.patch/g, 'api.patch');
  content = content.replace(/axios\.delete/g, 'api.delete');
  
  // Also fix any hardcoded http://localhost:3000 left
  content = content.replace(/http:\/\/localhost:3000\/api/g, '');
  
  fs.writeFileSync(p, content);
  console.log('Processed ' + file);
}
