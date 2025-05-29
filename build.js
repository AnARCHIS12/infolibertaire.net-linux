// build.js
const readline = require('readline');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Choisissez la plateforme à compiler :');
console.log('1. Windows (NSIS + Portable)');
console.log('2. Linux (deb + AppImage)');
rl.question('Votre choix (1 ou 2) : ', (answer) => {
  let cmd;
  if (answer.trim() === '1') {
    cmd = 'npx electron-builder --win nsis portable';
  } else if (answer.trim() === '2') {
    cmd = 'npx electron-builder --linux deb appimage';
  } else {
    console.log('Choix invalide.');
    rl.close();
    process.exit(1);
  }
  console.log('Compilation en cours...');
  const child = exec(cmd, { stdio: 'inherit' });
  child.stdout && child.stdout.pipe(process.stdout);
  child.stderr && child.stderr.pipe(process.stderr);
  child.on('close', (code) => {
    rl.close();
    process.exit(code);
  });
});
