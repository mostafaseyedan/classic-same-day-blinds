const fs = require('fs');
const glob = require('glob');

const files = glob.sync('apps/storefront/src/app/**/*.tsx');

let changedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // Replace standard long class strings with page-section
  newContent = newContent.replace(/className="px-6 pb-20 pt-10 md:px-10 lg:px-14"/g, 'className="page-section pb-20 pt-10"');
  newContent = newContent.replace(/className="px-5 pb-20 pt-8 md:px-10 lg:px-14"/g, 'className="page-section pb-20 pt-10"');
  newContent = newContent.replace(/className="px-6 pb-24 pt-10 md:px-10 lg:px-14"/g, 'className="page-section pb-24 pt-10"');
  newContent = newContent.replace(/className="px-6 pb-0 pt-10 md:px-10 lg:px-14"/g, 'className="page-section pb-0 pt-10"');
  
  // Specific file fixes
  if (file.includes('products/[slug]/page.tsx')) {
    newContent = newContent.replace(/className="bg-shell px-5 pb-18 pt-8 md:px-10 lg:px-14"/g, 'className="page-section bg-shell pb-18 pt-10"');
  }
  if (file.includes('room-visualizer/page.tsx')) {
    newContent = newContent.replace(/className="bg-shell px-6 py-16 md:px-10 lg:px-14"/g, 'className="page-section bg-shell pb-20 pt-10"');
    newContent = newContent.replace(/<Breadcrumbs\s+className="mb-6"/g, '<Breadcrumbs');
  }
  if (file.includes('order-confirmation/page.tsx') || file.includes('checkout/return/page.tsx')) {
    newContent = newContent.replace(/className="page-section pb-20 pt-12"/g, 'className="page-section pb-20 pt-10"');
  }

  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedCount++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Updated ${changedCount} files.`);
