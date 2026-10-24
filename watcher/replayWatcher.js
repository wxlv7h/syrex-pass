const {
  resolveDevices,
  getLatestReplayName,
  detectGameOnDevice,
  pathExists
} = require("../services/deviceManager");

const transferAll = require("./transferAll");

let iniciado = false;
let intervaloMonitoramento = null;
let ultimoReplay = null;
let gameSelecionadoManual = null;

let currentDevices = {
  emulator: null,
  realDevice: null,
  game: null
};

const GAMES = {
  max: {
    type: "max",
    label: "FREE FIRE MAX",
    packageName: "com.dts.freefiremax",
    replaysPath: "/storage/emulated/0/Android/data/com.dts.freefiremax/files/MReplays"
  },
  normal: {
    type: "normal",
    label: "FREE FIRE NORMAL",
    packageName: "com.dts.freefireth",
    replaysPath: "/storage/emulated/0/Android/data/com.dts.freefireth/files/MReplays"
  }
};

function normalizarConfig(config) {
  if (!config) return null;

  if (typeof config === "string") {
    return GAMES[config] || null;
  }

  if (config.gameType && GAMES[config.gameType]) {
    return {
      ...GAMES[config.gameType],
      ...config
    };
  }

  if (config.packageName && config.replayPath) {
    return {
      type: config.gameType || "custom",
      label: config.label || config.packageName,
      packageName: config.packageName,
      replaysPath: config.replayPath
    };
  }

  return null;
}

function setGameType(gameType) {
  if (GAMES[gameType]) {
    gameSelecionadoManual = GAMES[gameType];
    console.log(`Jogo selecionado manualmente: ${gameSelecionadoManual.label}`);
  }
}

function setGameConfig(config) {
  const game = normalizarConfig(config);

  if (game) {
    gameSelecionadoManual = game;
    console.log(`Configuração de jogo aplicada: ${game.label}`);
    console.log(`Pacote: ${game.packageName}`);
    console.log(`Replay path: ${game.replaysPath}`);
  }
}

async function bootstrap(config = null) {
 // console.log("Reconectando dispositivos...");

  const devices = await resolveDevices();

  if (devices.emulatorLabel) console.log(devices.emulatorLabel);
  if (devices.realDeviceLabel) console.log(devices.realDeviceLabel);

  currentDevices.emulator = devices.emulator || null;
  currentDevices.realDevice = devices.realDevice || null;

  if (!devices.emulator || !devices.realDevice) {
    console.warn("Emulador ou Real Device não encontrados.");
    return false;
  }

  let game = normalizarConfig(config) || gameSelecionadoManual;

  if (!game) {
    game = await detectGameOnDevice(devices.emulator.serial);
  }

  if (!game) {
    console.error("Não foi possível definir se o jogo é Free Fire normal ou MAX.");
    return false;
  }

  if (game.replayPath && !game.replaysPath) {
    game.replaysPath = game.replayPath;
  }

  currentDevices.game = game;

  console.log(`JOGO DETECTADO: ${game.label}`);
  //console.log(`REPLAY BASE: ${game.packageName}`);
 // console.log(`PASTA REPLAY: ${game.replaysPath}`);

  const existePasta = await pathExists(devices.emulator.serial, game.replaysPath);

  if (!existePasta) {
    console.error("A pasta de replay não existe no emulador.");
    console.error(`Caminho verificado: ${game.replaysPath}`);
    return false;
  }

  const atual = await getLatestReplayName(
    devices.emulator.serial,
    game.replaysPath
  );

  ultimoReplay = atual || null;

  if (ultimoReplay) {
    console.log(`Replay base atual: ${ultimoReplay}`);
  } else {
    console.warn("Nenhum replay base encontrado ainda.");
  }

  console.log("Dispositivos prontos.");
  return true;
}

async function verificarReplay() {
  try {
    if (!currentDevices.emulator || !currentDevices.realDevice || !currentDevices.game) {
      return;
    }

    const replayMaisRecente = await getLatestReplayName(
      currentDevices.emulator.serial,
      currentDevices.game.replaysPath
    );

    if (!replayMaisRecente) return;

    if (!ultimoReplay) {
      ultimoReplay = replayMaisRecente;
      console.log(`Replay base definido: ${ultimoReplay}`);
      return;
    }

    if (replayMaisRecente !== ultimoReplay) {
      ultimoReplay = replayMaisRecente;

      console.log(`Novo replay detectado: ${replayMaisRecente}`);

      await transferAll.transferirTudo({
        emulator: currentDevices.emulator,
        realDevice: currentDevices.realDevice,
        gameType: currentDevices.game.type,
        packageName: currentDevices.game.packageName,
        replayPath: currentDevices.game.replaysPath,
        replaysPath: currentDevices.game.replaysPath
      });

      console.log("Transferência completa finalizada com sucesso");
    }
  } catch (error) {
    console.error("Erro no monitoramento:", error.message);
  }
}

async function iniciar(config = null) {
  if (iniciado) {
    console.warn("Monitoramento já iniciado.");
    return;
  }

  const game = normalizarConfig(config);

  if (game) {
    gameSelecionadoManual = game;
  }

  iniciado = true;
//  console.log("Iniciando watcher...");

  const ok = await bootstrap(gameSelecionadoManual);

  if (!ok) {
    iniciado = false;
    return;
  }

  if (intervaloMonitoramento) {
    clearInterval(intervaloMonitoramento);
    intervaloMonitoramento = null;
  }

  console.log("Monitorando replays...");
  intervaloMonitoramento = setInterval(verificarReplay, 3000);
}

async function parar() {
  if (intervaloMonitoramento) {
    clearInterval(intervaloMonitoramento);
    intervaloMonitoramento = null;
  }

  iniciado = false;
  ultimoReplay = null;

  currentDevices = {
    emulator: null,
    realDevice: null,
    game: null
  };

  console.log("Monitoramento parado.");
}

async function reconectar(config = null) {
  console.log("Reconexão manual iniciada...");

  if (intervaloMonitoramento) {
    clearInterval(intervaloMonitoramento);
    intervaloMonitoramento = null;
  }

  const game = normalizarConfig(config);

  if (game) {
    gameSelecionadoManual = game;
  }

  const ok = await bootstrap(gameSelecionadoManual);

  if (!ok) {
    iniciado = false;
    return;
  }

  iniciado = true;
  console.log("Monitorando replays...");
  intervaloMonitoramento = setInterval(verificarReplay, 3000);
}

module.exports = {
  iniciar,
  parar,
  reconectar,
  setGameType,
  setGameConfig
};