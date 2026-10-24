const { ipcRenderer } = require("electron");
const { getMachineId } = require("./services/machineId");

const keyInput = document.getElementById("keyInput");
const activateBtn = document.getElementById("activateBtn");
const msg = document.getElementById("msg");
const machineIdText = document.getElementById("machineIdText");

function setMessage(text, type = "info") {
  msg.textContent = text;
  msg.className = "msg";

  if (type === "error") {
    msg.classList.add("err");
  } else if (type === "success") {
    msg.classList.add("ok");
  }
}

function formatMachineId(id) {
  if (!id) return "Indisponível";
  if (id.length <= 32) return id;
  return `${id.slice(0, 16)}...${id.slice(-12)}`;
}

window.addEventListener("DOMContentLoaded", () => {
  try {
    const machineId = getMachineId();
    machineIdText.textContent = formatMachineId(machineId);
  } catch (error) {
    console.error("Erro ao carregar machineId:", error);
    machineIdText.textContent = "Erro ao carregar";
  }
});

activateBtn.addEventListener("click", async () => {
  const key = keyInput.value.trim();

  if (!key) {
    setMessage("Digite uma key.", "error");
    return;
  }

  try {
    activateBtn.disabled = true;
    activateBtn.textContent = "Validando...";
    setMessage("Validando licença...");

    const result = await ipcRenderer.invoke("activate-license", key);

    if (!result.ok) {
      setMessage(result.message || "Falha na ativação.", "error");
      activateBtn.disabled = false;
      activateBtn.textContent = "Ativar Licença";
      return;
    }

    setMessage("Licença ativada com sucesso!", "success");

    setTimeout(async () => {
      await ipcRenderer.invoke("open-main-app");
    }, 700);
  } catch (error) {
    console.error("Erro na ativação:", error);
    setMessage("Erro de conexão com o servidor.", "error");
    activateBtn.disabled = false;
    activateBtn.textContent = "Ativar Licença";
  }
});

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (
    key === "f12" ||
    key === "alt" ||
    (e.ctrlKey && e.shiftKey && key === "i") ||
    (e.ctrlKey && e.shiftKey && key === "j") ||
    (e.ctrlKey && key === "u")
  ) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
});

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  return false;
});