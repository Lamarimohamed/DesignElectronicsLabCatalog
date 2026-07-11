#!/usr/bin/env node

// Set environment variables and run vite
process.env.VITE_SUPABASE_URL = 'https://xmymhkmmukxrffzkuxnd.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteW1oa21tdWt4cmZmemt1eG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1Nzk3OTUsImV4cCI6MjA5OTE1NTc5NX0.NqhNCwC1eO-O1B2Zu9CGFL3sZPrUfBSVI9gKf4-rg7w';

const { exec } = require('child_process');
const path = require('path');

// Change to project directory and run vite
const projectDir = 'C:\\Users\\Administrator\\Downloads\\Projects\\designcalatlog\\DesignElectronicsLabCatalog';
const command = 'npx vite --host 0.0.0.0';

exec(command, { cwd: projectDir, env: process.env }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});