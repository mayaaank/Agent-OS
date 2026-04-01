const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  let files = fs.readdirSync(dir);
  for (let f of files) {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      // ignore node_modules and .git
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
        walk(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  }
}

const targetDirs = ['./app', './features'];

targetDirs.forEach(dir => {
  walk(dir, (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    let original = fs.readFileSync(filePath, 'utf8');
    let content = original;
    
    // Gradients
    content = content.replace(/from-cyan-\d+(\/\d+)?/g, 'from-slate-700$1');
    content = content.replace(/to-purple-\d+(\/\d+)?/g, 'to-slate-800$1');
    
    // Colors
    content = content.replace(/text-cyan-\d+/g, 'text-blue-500');
    content = content.replace(/text-purple-\d+/g, 'text-blue-500');
    content = content.replace(/bg-cyan-\d+/g, 'bg-blue-600');
    content = content.replace(/bg-purple-\d+/g, 'bg-blue-700');
    content = content.replace(/border-cyan-\d+/g, 'border-slate-700');
    content = content.replace(/border-purple-\d+/g, 'border-slate-800');
    content = content.replace(/ring-cyan-\d+/g, 'ring-blue-500');
    content = content.replace(/ring-purple-\d+/g, 'ring-blue-600');
    content = content.replace(/text-slate-500/g, 'text-slate-400'); // Better contrast on dark mode
    content = content.replace(/text-slate-400/g, 'text-slate-300'); 
    
    // Shadows / Glows
    content = content.replace(/shadow-\[.*?\]/g, 'shadow-sm'); // removes arbitrary neon shadow
    content = content.replace(/glow-text/g, 'tracking-tight text-white');
    content = content.replace(/pulse-glow/g, 'animate-pulse');
    
    // Jargon / AI Slop
    content = content.replace(/Counselor/g, 'Processor');
    content = content.replace(/multi-agent reasoning cluster/g, 'distributed build engine');
    content = content.replace(/multi-agent cluster/g, 'build engine');
    content = content.replace(/Multi-Agent Status/g, 'System Status');
    content = content.replace(/AgentOS/g, 'AgentCore'); // gives it a techier sound
    content = content.replace(/Cyber/g, 'Tech');
    content = content.replace(/AI Requirement/g, ''); 
    content = content.replace(/What are we <br \/> <span className="text-blue-500">building<\/span> today\?/g, 'Initialize <br /> <span className="text-white bg-blue-600 px-2 rounded-md">build sequence</span>');
    content = content.replace(/Describe your concept in plain language. Our build engine will interpret your logic and refine it into a build-ready technical prompt./g, 'Input product specifications. The pipeline will parse semantics, execute architectural validation, and compile a finalized development prompt.');
    
    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  });
});
console.log('Done replacing strings.');
