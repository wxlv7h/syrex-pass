const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let integrityFailed = false;

function checkIntegrity() {
  try {
    const hashesPath = path.join(__dirname, 'integrityHashes.json');
    if (!fs.existsSync(hashesPath)) {
      console.log('Arquivo de hashes não encontrado');
      return true;
    }
    
    const expectedHashes = JSON.parse(fs.readFileSync(hashesPath, 'utf8'));
    
    for (const [file, expectedHash] of Object.entries(expectedHashes)) {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const currentHash = crypto.createHash('sha256').update(content).digest('hex');
        
        if (currentHash !== expectedHash) {
          console.error(`Integridade violada: ${file}`);
          integrityFailed = true;
          return false;
        }
      }
    }
    
    return true;
  } catch (err) {
    console.error('Erro na verificação de integridade:', err);
    return false;
  }
}

function isIntegrityFailed() {
  return integrityFailed;
}

module.exports = { checkIntegrity, isIntegrityFailed };