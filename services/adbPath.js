const path = require("path");
const fs = require("fs");

function getAdbPath() {
  const caminhos = [];

  if (process.resourcesPath) {
    caminhos.push(path.join(process.resourcesPath, "adb", "adb.exe"));
  }

  caminhos.push(path.join(process.cwd(), "adb", "adb.exe"));
  caminhos.push(path.join(__dirname, "..", "adb", "adb.exe"));

  for (const caminho of caminhos) {
    if (fs.existsSync(caminho)) {
      return caminho;
    }
  }

  console.error("ADB não encontrado. Caminhos testados:");
  caminhos.forEach((c) => console.error(c));

  return path.join(process.cwd(), "adb", "adb.exe");
}

module.exports = { getAdbPath };