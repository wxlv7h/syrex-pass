const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const JavaScriptObfuscator = require('javascript-obfuscator');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  🔒 SYREX - BUILD SEGURO');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📁 [1/5] Criando backup dos arquivos originais...');

const backupDir = path.join(__dirname, 'backup_temp');
if (fs.existsSync(backupDir)) {
  fs.rmSync(backupDir, { recursive: true, force: true });
}
fs.mkdirSync(backupDir, { recursive: true });

const filesToProtect = [
  'main.js',
  'services/deviceManager.js',
  'services/licenseApi.js',
  'services/machineId.js',
  'services/integrityCheck.js',
  'watcher/transferAll.js',
  'watcher/replayWatcher.js'
];

for (const file of filesToProtect) {
  const srcPath = path.join(__dirname, file);
  if (fs.existsSync(srcPath)) {
    const backupPath = path.join(backupDir, path.basename(file));
    fs.copyFileSync(srcPath, backupPath);
    console.log(`  ✅ Backup: ${file}`);
  }
}

console.log('\n🔒 [2/5] Ofuscando código JavaScript...');

for (const file of filesToProtect) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    const obfuscated = JavaScriptObfuscator.obfuscate(content, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: true,
      debugProtectionInterval: 2000,  
      disableConsoleOutput: false,
      identifierNamesGenerator: 'hexadecimal',
      numbersToExpressions: true,
      renameGlobals: false,
      selfDefending: true,
      simplify: true,
      splitStrings: true,
      splitStringsChunkLength: 10,
      stringArray: true,
      stringArrayEncoding: ['rc4'],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 2,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 2,
      stringArrayWrappersType: 'function',
      stringArrayThreshold: 0.75,
      transformObjectKeys: true,
      unicodeEscapeSequence: false
    });
    
    fs.writeFileSync(filePath, obfuscated.getObfuscatedCode());
    console.log(`  ✅ Ofuscado: ${file}`);
  } catch (err) {
    console.log(`  ⚠️ Erro ao ofuscar ${file}: ${err.message}`);
  }
}

console.log('\n🔐 [3/5] Gerando hashes de integridade...');

const crypto = require('crypto');
const integrityHashes = {};

for (const file of filesToProtect) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    integrityHashes[file] = hash;
    console.log(`  ✅ ${file}: ${hash.substring(0, 16)}...`);
  }
}

const hashFile = path.join(__dirname, 'services', 'integrityHashes.json');
fs.writeFileSync(hashFile, JSON.stringify(integrityHashes, null, 2));
console.log(`  ✅ Hashes salvos em services/integrityHashes.json`);

console.log('\n🧂 [4/5] Gerando salt para HWID...');

const hwidSalt = crypto.randomBytes(16).toString('hex');
const saltFile = path.join(__dirname, 'services', 'hwidSalt.json');
fs.writeFileSync(saltFile, JSON.stringify({ salt: hwidSalt }));
console.log(`  ✅ Salt gerado: ${hwidSalt.substring(0, 16)}...`);

console.log('\n📦 [5/5] Buildando aplicativo...');

try {
  execSync('npm run dist', { stdio: 'inherit' });
  console.log('\n✅ Build concluído com sucesso!');
} catch (err) {
  console.error('\n❌ Erro no build:', err.message);
}

console.log('\n🔄 Restaurando arquivos originais...');

for (const file of filesToProtect) {
  const srcPath = path.join(__dirname, file);
  const backupPath = path.join(backupDir, path.basename(file));
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, srcPath);
  }
}

fs.rmSync(backupDir, { recursive: true, force: true });
console.log('  ✅ Arquivos originais restaurados');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  ✅ BUILD SEGURO FINALIZADO!');
console.log('  📁 Instalador em: dist/');
console.log('═══════════════════════════════════════════════════════════\n');