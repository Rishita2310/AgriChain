const fs = require('fs');
const path = require('path');

const walk = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      filelist = walk(p, filelist);
    } else if (p.endsWith('.jsx') || p.endsWith('.js')) {
      filelist.push(p);
    }
  }
  return filelist;
};

const allFiles = walk(path.join(__dirname, 'src'));

for (const p of allFiles) {
  if (p.includes('src\\services')) continue; // Skip services, already refactored
  
  let content = fs.readFileSync(p, 'utf8');
  let changed = false;
  
  if (content.includes("import axios from 'axios';") && content.includes("http://localhost:3000/api")) {
    content = content.replace(/import axios from 'axios';/g, "import axios from '@/services/api';");
    content = content.replace(/http:\/\/localhost:3000\/api/g, "");
    changed = true;
  }
  
  // For files that have <img src={`http://localhost:3000${url}`}
  if (content.includes("http://localhost:3000${")) {
    if (!content.includes("BASE_URL")) {
      // Find the last import and append the import for BASE_URL
      const lastImportIndex = content.lastIndexOf('import ');
      const endOfLastImport = content.indexOf('\n', lastImportIndex) + 1;
      content = content.slice(0, endOfLastImport) + "import { BASE_URL } from '@/services/api';\n" + content.slice(endOfLastImport);
    }
    content = content.replace(/http:\/\/localhost:3000\$\{/g, "${BASE_URL}${");
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(p, content);
    console.log('Processed ' + p);
  }
}
