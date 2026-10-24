const { exec } = require("child_process");
const { getAdbPath } = require("./adbPath");
const { EMULATOR_TARGETS, GAMES } = require("../config/appConfig.js");

const adbPath = `"${getAdbPath()}"`;

function executar(comando) {
  return new Promise((resolve) => {
    exec(comando, (err, stdout, stderr) => {
      resolve({
        err,
        stdout: stdout || "",
        stderr: stderr || ""
      });
    });
  });
}

function isEmulatorSerial(serial) {
  const s = String(serial || "").toLowerCase();
  return (
    s.startsWith("127.0.0.1:") ||
    s.startsWith("localhost:") ||
    s.startsWith("emulator-")
  );
}

async function connectKnownEmulators() {
  for (const alvo of EMULATOR_TARGETS) {
    const result = await executar(`${adbPath} connect ${alvo}`);
    const text = `${result.stdout} ${result.stderr}`.trim().toLowerCase();

    if (text.includes("connected to") || text.includes("already connected")) {
    }
  }
}

async function listDevices() {
  const result = await executar(`${adbPath} devices`);

  if (result.err) {
    throw new Error(result.err.message);
  }

  const linhas = result.stdout
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  const devices = [];

  for (const linha of linhas) {
    if (linha.startsWith("List of devices attached")) continue;

    const parts = linha.split(/\s+/);
    const serial = parts[0];
    const state = parts[1];

    if (serial && state === "device") {
      devices.push({
        serial,
        state,
        emulator: isEmulatorSerial(serial)
      });
    }
  }

  return devices;
}

async function getModel(serial) {
  const result = await executar(`${adbPath} -s ${serial} shell getprop ro.product.model`);
  if (result.err) return serial;
  return result.stdout.trim() || serial;
}

async function pathExists(serial, targetPath) {
  const result = await executar(`${adbPath} -s ${serial} shell "test -d '${targetPath}' && echo exists"`);
  return !(result.err || !result.stdout.includes('exists'));
}

async function detectGameOnDevice(serial) {
  const normalExists = await pathExists(serial, GAMES.NORMAL.replaysPath);
  const maxExists = await pathExists(serial, GAMES.MAX.replaysPath);

  if (maxExists) return GAMES.MAX;
  if (normalExists) return GAMES.NORMAL;

  return null;
}

async function resolveDevices() {
  await connectKnownEmulators();
  const devices = await listDevices();

  const emuladoresUnicos = [];
  const seriaisJaVistos = new Set();

  for (const device of devices.filter(d => d.emulator)) {
    let serialNormalizado = device.serial.toLowerCase();
    
    if (serialNormalizado.startsWith("localhost:")) {
      serialNormalizado = serialNormalizado.replace("localhost:", "127.0.0.1:");
    }
    
    const ipBase = serialNormalizado.split(":")[0];
    
    if (!seriaisJaVistos.has(ipBase)) {
      seriaisJaVistos.add(ipBase);
      emuladoresUnicos.push(device);
    }
  }


  const ordemPrioridade = [
    "127.0.0.1:5555",
    "127.0.0.1:5556",
    "127.0.0.1:5557",
    "127.0.0.1:51129",
    "localhost:5555",
    "localhost:5556",
    "localhost:5557",
    "localhost:51129"
  ];
  
  let emulator = null;
  

  for (const prioridade of ordemPrioridade) {
    emulator = emuladoresUnicos.find(d => d.serial === prioridade);
    if (emulator) break;
  }
  

  if (!emulator && emuladoresUnicos.length > 0) {
    emulator = emuladoresUnicos[0];
  }


  const realDevice = devices.find(d => !d.emulator) || null;

  let emulatorLabel = "Emulador-(não detectado)";
  let realDeviceLabel = "Real Device - não detectado";

  if (emulator) {
    emulatorLabel = `Emulador-(${emulator.serial})`;
  }

  if (realDevice) {
    const model = await getModel(realDevice.serial);
    realDeviceLabel = `Real Device - ${model}`;
    realDevice.model = model;
  }

  return {
    emulator,
    realDevice,
    emulatorLabel,
    realDeviceLabel
  };
}

async function getLatestReplayName(serial, replaysPath) {
  const result = await executar(`${adbPath} -s ${serial} shell "ls -t '${replaysPath}' 2>/dev/null | head -1"`);

  if (result.err || !result.stdout) return null;

  const nome = result.stdout.trim();
  return nome && nome.endsWith("_rep.bin") ? nome : null;
}

module.exports = {
  executar,
  resolveDevices,
  getLatestReplayName,
  getAdbPath,
  pathExists,
  detectGameOnDevice
};