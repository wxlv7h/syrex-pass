const fs = require("fs");
const path = require("path");
const os = require("os");
const {
  executar,
  resolveDevices,
  getAdbPath,
  detectGameOnDevice
} = require("../services/deviceManager");

const adbPath = `"${getAdbPath()}"`;

const PACKAGES = {
  FF_NORMAL: "com.dts.freefireth",
  FF_MAX: "com.dts.freefiremax"
};

async function transferirTudo(options = {}) {
  const devices = await resolveDevices();
  const emulator = devices.emulator;
  const realDevice = devices.realDevice;
 
  if (!emulator || !realDevice) return false;
  
  let game = await detectGameOnDevice(emulator.serial);
  
  if (!game) {
    const checkMax = await executar(`${adbPath} -s ${emulator.serial} shell "pm list packages | grep ${PACKAGES.FF_MAX}"`);
    if (checkMax.stdout && checkMax.stdout.trim()) {
      game = {
        label: "Free Fire MAX",
        packageName: PACKAGES.FF_MAX,
        replaysPath: `/storage/emulated/0/Android/data/${PACKAGES.FF_MAX}/files/MReplays/`
      };
    } else return false;
  }
  
  const realReplaysPath = `/storage/emulated/0/Android/data/${game.packageName}/files/MReplays/`;
  const stagePath = `/storage/emulated/0/Android/data/${game.packageName}/files/MReplays_stage`;
  
  const ancoraResult = await executar(
    `${adbPath} -s ${realDevice.serial} shell "ls -t ${realReplaysPath}*.bin 2>/dev/null | head -1"`
  );
  
  if (!ancoraResult.stdout || !ancoraResult.stdout.trim()) {
    console.log("❌ Nenhum replay âncora encontrado!");
    return false;
  }
  
  let ancoraBin = path.basename(ancoraResult.stdout.trim());
  let ancoraJson = ancoraBin.replace('.bin', '.json');
  
  const emuResult = await executar(
    `${adbPath} -s ${emulator.serial} shell "ls -t ${game.replaysPath}*.bin 2>/dev/null | head -6"`
  );
  
  if (!emuResult.stdout || !emuResult.stdout.trim()) return false;
  
  const replayBomList = emuResult.stdout.trim().split('\n');
  let successCount = 0;
  
  for (let i = 0; i < replayBomList.length; i++) {
    const replayBomPath = replayBomList[i];
    const replayBomNome = path.basename(replayBomPath);
    const replayBomTimestamp = replayBomNome.substring(0, 19);
    
    const agora = new Date();
    const newTimestamp = `${agora.getFullYear()}-${String(agora.getMonth()+1).padStart(2,'0')}-${String(agora.getDate()).padStart(2,'0')}-${String(agora.getHours()).padStart(2,'0')}-${String(agora.getMinutes()).padStart(2,'0')}-${String(agora.getSeconds()).padStart(2,'0')}`;
    const sufixo = replayBomNome.substring(19);
    const novoNomeBin = `${newTimestamp}${sufixo}`;
    const novoNomeJson = novoNomeBin.replace('.bin', '.json');
    
    const tempDir = path.join(os.tmpdir(), "tmp_" + Date.now() + "_" + i);
    fs.mkdirSync(tempDir, { recursive: true });
    
    const tempBin = path.join(tempDir, "temp.bin");
    const tempJson = path.join(tempDir, "temp.json");
    
    await executar(`${adbPath} -s ${emulator.serial} pull "${replayBomPath}" "${tempBin}"`);
    await executar(`${adbPath} -s ${emulator.serial} pull "${replayBomPath.replace('.bin', '.json')}" "${tempJson}"`);
    
    await executar(`${adbPath} -s ${realDevice.serial} shell "mkdir -p ${stagePath}"`);
    await executar(`${adbPath} -s ${realDevice.serial} push "${tempBin}" "${stagePath}/${replayBomNome}"`);
    await executar(`${adbPath} -s ${realDevice.serial} push "${tempJson}" "${stagePath}/${replayBomNome.replace('.bin', '.json')}"`);
    
    await executar(`${adbPath} -s ${realDevice.serial} shell "mv '${realReplaysPath}${ancoraBin}' '${realReplaysPath}${novoNomeBin}'"`);
    await executar(`${adbPath} -s ${realDevice.serial} shell "mv '${realReplaysPath}${ancoraJson}' '${realReplaysPath}${novoNomeJson}'"`);
    
    await executar(`${adbPath} -s ${realDevice.serial} shell "am force-stop ${game.packageName}"`);
    await new Promise(r => setTimeout(r, 1000));
    
    await executar(`${adbPath} -s ${realDevice.serial} shell "cat '${stagePath}/${replayBomNome}' > '${realReplaysPath}${novoNomeBin}'"`);
    
    const jsonRaw = await executar(`${adbPath} -s ${realDevice.serial} shell "cat '${stagePath}/${replayBomNome.replace('.bin', '.json')}'"`);
    
    if (jsonRaw.stdout) {
      let jsonFixed = jsonRaw.stdout;
      jsonFixed = jsonFixed.replace(new RegExp(replayBomTimestamp, 'g'), newTimestamp);
      jsonFixed = jsonFixed.replace(/1\.12[0-9]\.[0-9]/g, '1.123.1');
      jsonFixed = jsonFixed.replace(/"IsSaved":true/g, '"IsSaved":false');
      jsonFixed = jsonFixed.replace(/\0/g, '');
      
      const jsonBase64 = Buffer.from(jsonFixed, 'utf8').toString('base64');
      const finalCmd = `run-as ${game.packageName} sh -c "echo '${jsonBase64}' | base64 -d > ${realReplaysPath}${novoNomeJson}"`;
      await executar(`${adbPath} -s ${realDevice.serial} shell "${finalCmd}"`);
    }
    
    await executar(`${adbPath} -s ${realDevice.serial} shell "chmod 660 '${realReplaysPath}${novoNomeBin}'"`);
    await executar(`${adbPath} -s ${realDevice.serial} shell "chmod 660 '${realReplaysPath}${novoNomeJson}'"`);
    await executar(`${adbPath} -s ${realDevice.serial} shell "chgrp 1078 '${realReplaysPath}${novoNomeBin}'"`);
    await executar(`${adbPath} -s ${realDevice.serial} shell "chgrp 1078 '${realReplaysPath}${novoNomeJson}'"`);
    
    await executar(`${adbPath} -s ${realDevice.serial} shell "touch '${realReplaysPath}${novoNomeBin}' '${realReplaysPath}${novoNomeJson}'"`);
    
    ancoraBin = novoNomeBin;
    ancoraJson = novoNomeJson;
    
    fs.rmSync(tempDir, { recursive: true, force: true });
    successCount++;
  }
  
  await executar(`${adbPath} -s ${realDevice.serial} shell "rm -rf ${stagePath}"`);
  await executar(`${adbPath} -s ${realDevice.serial} shell "logcat -c"`);
  await executar(`${adbPath} -s ${realDevice.serial} shell "sync"`);
  
  const finalBin = await executar(`${adbPath} -s ${realDevice.serial} shell "ls -t ${realReplaysPath}*.bin 2>/dev/null | head -1"`);
  let finalOwner = "N/A";
  let finalPerms = "N/A";
  
  if (finalBin.stdout && finalBin.stdout.trim()) {
    const finalFile = path.basename(finalBin.stdout.trim());
    const checkOwner = await executar(`${adbPath} -s ${realDevice.serial} shell "stat -c '%u' '${realReplaysPath}${finalFile}'"`);
    const checkPerms = await executar(`${adbPath} -s ${realDevice.serial} shell "stat -c '%a' '${realReplaysPath}${finalFile}'"`);
    finalOwner = checkOwner.stdout?.trim() || "N/A";
    finalPerms = checkPerms.stdout?.trim() || "N/A";
  }
  
  await executar(`${adbPath} -s ${realDevice.serial} shell "monkey -p ${game.packageName} 1"`);
  
  console.log(`\n✅ ${successCount}/${replayBomList.length} replays transferidos`);
  console.log(`👤 Owner final: ${finalOwner} | 🔐 Perms: ${finalPerms}`);
  
  return successCount > 0;
}

module.exports = { transferirTudo };