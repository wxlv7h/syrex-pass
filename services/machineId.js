const os = require("os");
const crypto = require("crypto");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const HARDCODED_SALT = "SYREX_2026_SECURE_SALT_7x9k2m4n";

function checkSelfIntegrity() {
  try {
    const currentFile = fs.readFileSync(__filename, 'utf8');
    const hash = crypto.createHash('md5').update(currentFile).digest('hex');
    
    const expectedHash = process.env.MACHINE_ID_HASH || "SKIP_CHECK";
    if (expectedHash !== "SKIP_CHECK" && hash !== expectedHash) {
      console.error("Arquivo machineId.js foi alterado");
      return false;
    }
    return true;
  } catch (e) {
    return true;
  }
}

function run(command) {
  try {
    return execSync(command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000
    });
  } catch {
    return "";
  }
}

function cleanWmicOutput(output) {
  return output
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !/^(serialnumber|processorid|uuid|name)$/i.test(line))
    .join("|");
}

function getStableWindowsHardwareId() {
  const uuid = cleanWmicOutput(run("wmic csproduct get uuid"));
  const bios = cleanWmicOutput(run("wmic bios get serialnumber"));
  const cpu = cleanWmicOutput(run("wmic cpu get processorid"));
  const board = cleanWmicOutput(run("wmic baseboard get serialnumber"));
  const disk = cleanWmicOutput(run("wmic diskdrive get serialnumber"));
  const mac = getMacAddress();

  const raw = [
    uuid,
    bios,
    cpu,
    board,
    disk,
    mac,
    os.arch()
  ].join("||");

  if (!raw.replace(/\|/g, "").trim()) {
    return "";
  }

  const hash = crypto.createHash("sha256").update(raw + HARDCODED_SALT).digest("hex");
  return hash;
}

function getMacAddress() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
          return iface.mac.replace(/:/g, '');
        }
      }
    }
  } catch (e) {}
  return "";
}

function getRegistryMachineGuid() {
  try {
    const output = run('reg query "HKLM\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid');
    const match = output.match(/MachineGuid\s+REG_SZ\s+(\S+)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch (e) {}
  return "";
}

function getSystemDriveSerial() {
  try {
    const output = run('wmic logicaldisk where "DeviceID=\'C:\'" get VolumeSerialNumber');
    const lines = output.split(/\r?\n/);
    for (const line of lines) {
      const serial = line.trim();
      if (serial && /^[A-F0-9]{8}$/i.test(serial)) {
        return serial;
      }
    }
  } catch (e) {}
  return "";
}

function getFallbackId() {
  const raw = [
    os.hostname(),
    os.platform(),
    os.arch(),
    os.cpus()?.[0]?.model || "",
    os.totalmem(),
    os.userInfo()?.username || "",
    getRegistryMachineGuid(),
    getSystemDriveSerial()
  ].join("||");

  const hash = crypto.createHash("sha256").update(raw + HARDCODED_SALT).digest("hex");
  return hash;
}

function getVirtualMachineCheck() {
  try {
    const vmIndicators = [
      'vbox', 'vmware', 'qemu', 'virtual', 'hyper-v', 'kvm', 'xen'
    ];
    
    const cpuModel = os.cpus()?.[0]?.model?.toLowerCase() || "";
    const systemInfo = run('systeminfo 2>nul | findstr /i "System Manufacturer"');
    
    for (const indicator of vmIndicators) {
      if (cpuModel.includes(indicator) || systemInfo.toLowerCase().includes(indicator)) {
        return true;
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}

function getMachineId() {
  if (!checkSelfIntegrity()) {
    return crypto.randomBytes(32).toString('hex');
  }
  
  let stableId = "";
  
  if (process.platform === "win32") {
    stableId = getStableWindowsHardwareId();
    if (stableId) {
      const isVM = getVirtualMachineCheck();
      if (isVM) {
        stableId = crypto.createHash("sha256").update(stableId + "VM_DETECTED").digest("hex");
      }
      return stableId;
    }
  }

  return getFallbackId();
}

function validateHardwareId(hwid) {
  if (!hwid || typeof hwid !== 'string') return false;
  if (!/^[a-f0-9]{64}$/i.test(hwid)) return false;
  return true;
}

function getAppInstanceId() {
  const raw = [
    getMachineId(),
    Date.now().toString(),
    Math.random().toString()
  ].join("|");
  return crypto.createHash("sha256").update(raw).digest("hex").substring(0, 16);
}

module.exports = { 
  getMachineId, 
  validateHardwareId,
  getAppInstanceId,
  getVirtualMachineCheck
};