const { exec } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');

// Absolute path to your watcher directory
const watchDir = 'C:/Users/Sumit/Documents/zithara/campaigns-frontend'; // Ensure you use forward slashes

// Change working directory to the watcher directory
process.chdir(watchDir);

// Function to execute shell commands
const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    const process = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
      resolve();
    });

    process.stdout.on('data', (data) => {
      console.log(data);
    });
  });
};

// Watcher setup
const watcher = chokidar.watch(`${watchDir}/**/*.{js,jsx,ts,tsx,json}`, {
  ignored: /node_modules|\.next|\.git|build/, // Ignore unnecessary directories and build folder
  persistent: true,
  ignoreInitial: true, // Avoid triggering the watcher on initial load
});

// Build and start process
let isBuilding = false; // Flag to prevent multiple builds at the same time

const buildAndStart = async () => {
  if (isBuilding) {
    console.log('Build process already running, skipping...');
    return; // Prevent overlapping builds
  }

  isBuilding = true;
  console.log('Change detected. Starting build...');
  try {
    await runCommand('npm run build'); // Run the build command in the watcher directory
    console.log('Build completed. Starting the application...');
    await runCommand('npm run start'); // Run the start command in the watcher directory
  } catch (error) {
    console.error('Failed to build or start the application.');
  } finally {
    isBuilding = false;
  }
};

// Start watching for changes
watcher.on('change', (filePath) => {
  console.log(`File ${filePath} has been changed. Rebuilding...`);
  buildAndStart();
});

// Run build and start immediately on script load
console.log('Initial build and start...');
buildAndStart().then(() => {
    console.log(`Watching for file changes in ${watchDir}...`); 
}).catch((error) => {
    console.error(`Failed to build or start the application: ${error}`);
});
