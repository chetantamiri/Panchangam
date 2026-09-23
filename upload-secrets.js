const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found!');
  process.exit(1);
}

const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
console.log(`Found .env file. Parsing variables...`);

for (const line of lines) {
  const cleanLine = line.trim();
  // Skip comments and empty lines
  if (!cleanLine || cleanLine.startsWith('#')) continue;
  
  const match = cleanLine.match(/^([^#=]+)=(.*)$/);
  if (!match) continue;
  
  const name = match[1].trim();
  let value = match[2].trim();
  
  // Remove wrapping quotes if they exist
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.substring(1, value.length - 1);
  }
  
  console.log(`Uploading EAS Secret: ${name}...`);
  try {
    execSync(`eas secret:create --scope project --force --type string --name "${name}" --value "${value}"`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to upload ${name}:`, error.message);
  }
}

console.log('EAS Secrets sync complete!');
