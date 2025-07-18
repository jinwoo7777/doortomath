/**
 * Script to run tests for the student comment feature
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define test files
const testFiles = [
  'src/lib/api/__tests__/students.test.js',
  'src/components/admin/dashboard/student-management/__tests__/StudentCommentModal.test.jsx',
  'src/components/admin/dashboard/student-management/components/__tests__/StudentCommentList.test.jsx',
  'src/app/api/admin/students/comments/__tests__/route.test.js',
  'src/app/api/admin/students/comments/[id]/__tests__/route.test.js',
  'src/components/admin/dashboard/student-management/__tests__/StudentCommentUIUX.test.jsx',
  'src/components/admin/dashboard/student-management/__tests__/StudentCommentPermissions.test.jsx'
];

// Check if test files exist
const missingFiles = testFiles.filter(file => !fs.existsSync(path.resolve(file)));
if (missingFiles.length > 0) {
  console.error('Error: The following test files are missing:');
  missingFiles.forEach(file => console.error(`  - ${file}`));
  process.exit(1);
}

// Run tests
console.log('Running student comment feature tests...');
console.log('=====================================');

try {
  // Run Jest with the specified test files
  execSync(`npx jest ${testFiles.join(' ')} --verbose`, { stdio: 'inherit' });
  console.log('All tests completed successfully!');
} catch (error) {
  console.error('Tests failed with error:', error.message);
  process.exit(1);
}