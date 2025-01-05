const fs = require('fs');
const path = require('path');

// Function to recursively find all HTML files
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            fileList = findHtmlFiles(filePath, fileList);
        } else if (path.extname(file) === '.html') {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Function to update HTML file
function updateHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Don't modify if already updated
    if (content.includes('components.js')) {
        return;
    }
    
    // Update head section
    content = content.replace(/<head>[\s\S]*?<title>/i, `<head>
    <script src="/js/components.js"></script>
    <script>
        document.write(Components.getHeader('${path.basename(filePath, '.html')}'));
    </script>
    <title>`);
    
    // Update html tag
    content = content.replace(/<html[^>]*>/i, '<html lang="en">');
    
    // Add theme toggle to navigation if it exists
    content = content.replace(
        /<div class="nav-links[^"]*">/i,
        `<div class="nav-links flex items-center gap-4">
                <script>document.write(Components.getThemeToggle());</script>`
    );
    
    // Update file paths to be absolute
    content = content.replace(/href="(?!http|\/)(.*?)"/g, 'href="/$1"');
    content = content.replace(/src="(?!http|\/)(.*?)"/g, 'src="/$1"');
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
}

// Find and update all HTML files
const htmlFiles = findHtmlFiles('.');
htmlFiles.forEach(updateHtmlFile);

console.log('All HTML files have been updated with dark mode support.'); 