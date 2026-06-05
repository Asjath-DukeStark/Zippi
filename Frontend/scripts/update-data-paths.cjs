const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data.ts');
let content = fs.readFileSync(dataPath, 'utf8');

// Regex to match product blocks and replace the image URL with local path
const updatedContent = content.replace(/(id:\s*'([^']+)'[\s\S]*?image:\s*')([^']+)('/g, (match, prefix, id, suffix) => {
  // Only replace if it looks like a remote URL (contains http)
  if (suffix.includes('http') || match.includes('unsplash') || match.includes('photo-')) {
    console.log(`Replacing image for product '${id}'...`);
    return prefix + `/products/product-${id}.jpg` + `'`;
  }
  return match;
});

fs.writeFileSync(dataPath, updatedContent, 'utf8');
console.log('Successfully updated all product image paths in data.ts!');
