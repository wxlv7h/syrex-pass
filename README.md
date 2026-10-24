<div align="center">

# ⚡ SYREX

### *Replay Passer Automático para Free Fire com Stealth Core v3*

![Electron](https://img.shields.io/badge/Electron-1976D2?style=for-the-badge&logo=electron&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Platform](https://img.shields.io/badge/Plataforma-Windows%20%7C%20Linux%20%7C%20macOS-000000?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Ativo-success?style=for-the-badge)
![License](https://img.shields.io/badge/Licen%C3%A7a-MIT-blue?style=for-the-badge)

<p align="center">
  Uma solução desktop de alta precisão projetada para automatizar e disfarçar a transferência de arquivos de replay do Free Fire entre emuladores e dispositivos Android físicos sem deixar rastros detectáveis.
</p>

[Sobre](#-sobre-o-projeto) • [Stealth Core](#-stealth-core-v3-destaque) • [Instalação](#-instalação) • [Como Usar](#-como-usar) • [FAQ](#-solução-de-problemas-faq)

</div>

---

> ⚠️ **AVISO LEGAL E ISENÇÃO DE RESPONSABILIDADE**
>
> Este software foi desenvolvido **exclusivamente para fins educacionais, de pesquisa e análise de segurança de sistemas de arquivos Android**. O uso desta ferramenta para burlar diretrizes, termos de serviço ou sistemas de integridade do jogo Free Fire (Garena) pode resultar em penalidades na conta, incluindo banimento temporário ou permanente.
>
> Os desenvolvedores e contribuidores deste projeto **não se responsabilizam** pelo uso inadequado, perdas, banimentos ou quaisquer danos decorrentes do uso desta aplicação. O uso é de total responsabilidade do usuário final.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Requisitos do Sistema](#-requisitos-do-sistema)
- [Instalação](#-instalação)
- [Como Usar](#-como-usar)
- [Como Funciona (Técnico)](#-como-funciona-técnico)
- [Stealth Core v3 (Destaque)](#-stealth-core-v3-destaque)
- [Estrutura de Arquivos](#-estrutura-de-arquivos)
- [Limitações Conhecidas](#-limitações-conhecidas)
- [Solução de Problemas (FAQ)](#-solução-de-problemas-faq)
- [Roadmap Futuro](#-roadmap-futuro)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)
- [Contato](#-contato)
- [Agradecimentos](#-agradecimentos)

---

## 🖤 Sobre o Projeto

O **SYREX** é uma aplicação desktop desenvolvida sob a plataforma **Electron** com **Node.js**, criada com o objetivo de automatizar o processo de migração de partidas salvas (*replays*) do Free Fire geradas em emuladores Android no PC para dispositivos móveis reais.

O principal diferencial do SYREX reside na tecnologia proprietária **Stealth Core v3**. Em transferências comuns via ADB ou MTP, os arquivos gravados no celular recebem metadados de sistema atribuídos ao usuário `shell` ou ao cliente MTP, além de marcas temporais zeradas ou incoerentes. Scanners anti-cheat modernos (como o *DG7 SS*) identificam facilmente essas anomalias. 

O SYREX resolve este problema interceptando e reescrevendo em tempo real os atributos POSIX e contextos SELinux, fazendo com que os arquivos pareçam ter sido gravados diretamente pelo processo do próprio jogo no celular.

---

## ✨ Funcionalidades Principais

- 🎨 **Interface All-Black Minimalista:** Dashboard moderna em Electron com tema escuro industrial e baixo consumo de recursos.
- 🎯 **Suporte Dual-Target:** Compatibilidade total com Free Fire NORMAL (`com.dts.freefireth`) e Free Fire MAX (`com.dts.freefiremax`).
- 🔄 **Monitoramento Automático:** Escaneamento contínuo da pasta de replays do emulador para detecção do arquivo mais recente.
- 📦 **Sincronização Seletiva:** Transferência cirúrgica apenas dos pares de arquivos válidos (`.bin` e `.json`).
- 🛡️ **Stealth Core v3:**
  - Injeção e alteração do UID/GID para `u0_aXXX` (proprietário real do aplicativo Free Fire).
  - Preservação e sincronização fina de timestamps (*Access, Modify, Change*) com precisão de nanossegundos não-zerados.
  - Atribuição exata de permissões POSIX (`660`) e grupo Android (`1078_media_rw` / `app_data`).
- 🚫 **Bypass de Anti-Cheat:** Evasão de scanners de integridade e varreduras de arquivos locais (ex: DG7 SS).
- 🧹 **Anti-Forensic ADB Cleanup:** Destruição automática de logs do ADB (`logcat`), caches temporários e instâncias suspensas.
- 🔑 **Sistema de Licenciamento:** Controle de acesso integrado com validação via API online e contador regressivo.
- 🕹️ **Controles Diretos:** Botões para Iniciar Monitoramento, Reconectar Dispositivos, Forçar Transferência e Encerrar processos paralelos (Termux/Brevent).
- 📜 **Console Log em Tempo Real:** Terminal embutido na interface exibindo a execução das chamadas de sistema etapa por etapa.

---

## 🛠 Requisitos do Sistema

| Componente | Requisito Mínimo | Requisito Recomendado |
| :--- | :--- | :--- |
| **Sistema Operacional** | Windows 10 (64-bit) / Linux / macOS | Windows 11 (64-bit) |
| **Ambiente Node.js** | Node.js v18.0.0 ou superior | Node.js v20.x LTS |
| **Android ADB** | ADB v1.0.41+ (Incluso no SDK Tools) | ADB v1.0.41+ configurado no `PATH` |
| **Emulador Android** | LDPlayer 9 / BlueStacks 5 / MSI App Player | LDPlayer 9 (com ADB habilitado) |
| **Celular Android** | Android 9.0 (Pie) ou superior | Android 11+ com Depuração USB e Root (Opcional) |
| **Jogo** | Free Fire ou Free Fire MAX instalado | Ambas as pontas na mesma versão do jogo |

---

## 📥 Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/syrex.git
cd syrex
```

### 2. Instalar as Dependências

```bash
npm install
```

### 3. Executar em Modo de Desenvolvimento

```bash
npm start
```

### 4. Compilar o Executável (.exe)

Para gerar o instalador desktop para Windows:

```bash
npm run build
```

O instalador será gerado no diretório `/dist`.

---

## 🚀 Como Usar

### Passo 1: Preparação do Ambiente
1. Conecte o **Emulador Android** no PC e certifique-se de que a opção de ponte ADB está ativa (ex: `localhost:5555`).
2. Conecte o **Celular Android** ao PC via cabo USB e ative a **Depuração USB** nas Opções do Desenvolvedor.
3. Garanta que o comando `adb devices` no terminal reconheça ambos os dispositivos.

### Passo 2: Gerando o Replay
1. Abra o Free Fire no emulador e jogue uma partida.
2. Ao final da partida, salve o replay nativamente na interface do jogo.

### Passo 3: Executando o SYREX
1. Abra o **SYREX**.
2. Cole sua chave de licença no campo indicado e valide seu acesso.
3. Selecione a versão do jogo desejada (`NORMAL` ou `MAX`).
4. Clique no botão **"Reconectar"** para validar o vínculo com o emulador e o celular.
5. Clique em **"Iniciar Monitoramento"**. O SYREX aguardará a criação do novo arquivo no emulador.
6. Ao detectar o arquivo, o SYREX executa a extração, aplica o **Stealth Core v3**, envia para o celular e ajusta os metadados.
7. O console na interface confirmará o sucesso da operação com a mensagem `[STEALTH] Metadados sincronizados e mascarados com sucesso.`.

---

## 🔬 Como Funciona (Técnico)

```
┌─────────────────┐       ┌──────────────────┐       ┌───────────────────┐
│ Emulador (PC)   │ ────> │   SYREX Core     │ ────> │ Celular Android   │
│ Replay Criado   │ Pull  │ (Electron Engine)│ Push  │ /sdcard/Android/..│
└─────────────────┘       └──────────────────┘       └───────────────────┘
                                   │                           │
                                   ▼                           ▼
                           [ Hook & Payload ] ──> [ Syscall Overwrite ]
                                                    - UID: u0_aXXX
                                                    - chmod 660 / chgrp 1078
                                                    - touch -d (nanoseconds)
```

1. **Detecção Dinâmica:** O SYREX executa rotinas periódicas de inspeção via `adb shell ls -l -t` nas pastas do jogo.
2. **Extração Silenciosa:** O arquivo `.bin` e o manifesto `.json` são copiados para um buffer em memória no PC (`adb pull`).
3. **Injeção de Metadados:** O arquivo é gravado no diretório de destino do celular (`adb push`).
4. **Execução do Stealth Core:** Comandos de baixo nível são chamados para regravar a tabela de Inodes do sistema de arquivos ext4/f2fs do Android.
5. **Sanitização de Rastros:** Limpeza de buffers temporários e redefinição dos logs de execução do daemon do ADB no celular.

---

## 🛡️ Stealth Core v3 (Destaque)

O **Stealth Core v3** é a camada responsável por neutralizar as verificações de integridade realizadas por soluções anti-cheat de terceiros e varreduras locais.

### Comparativo de Transferência

| Atributo de Arquivo | Transferência ADB Comum | Transferência SYREX (Stealth Core v3) |
| :--- | :--- | :--- |
| **UID (User ID)** | `2000` (`shell`) ❌ | `10XXX` (`u0_aXXX` do Free Fire) 🟢 |
| **GID (Group ID)** | `2000` (`shell`) / `1015` ❌ | `1078` (`media_rw`) / App Group 🟢 |
| **Permissões POSIX** | `-rw-rw-r--` (`664`) ou `777` ❌ | `-rw-rw----` (`660`) 🟢 |
| **Timestamps (mtime/atime)**| Horário exato do Push no PC ❌ | Espelhados do replay original no emulador 🟢 |
| **Nanossegundos** | `.000000000` (Zerados) ❌ | Valores estocásticos realistas 🟢 |
| **Contexto SELinux** | `u:object_r:shell_data_file` ❌ | `u:object_r:app_data_file` 🟢 |

### Como o Hook de Syscall e a Interceptação Funcionam

O Stealth Core atua interceptando a chamada de sistema `stat()` e `fstatat()` realizada pelos scanners anti-cheat. Em vez de apenas modificar os arquivos estaticamente no disco, o módulo executa um ajuste em tempo de escrita no arquivo via Android Shell utilizando chamadas avançadas:

```bash
# Exemplo de comandos executados internamente pelo Stealth Core
chown u0_a123:1078 /sdcard/Android/data/com.dts.freefireth/files/replay.bin
chmod 660 /sdcard/Android/data/com.dts.freefireth/files/replay.bin
touch -m -a -t 202610240349.12 /sdcard/Android/data/com.dts.freefireth/files/replay.bin
restorecon -R /sdcard/Android/data/com.dts.freefireth/files/
```

Dessa forma, quando o scanner inspeciona a pasta de replays, os dados lidos correspondem exatamente ao padrão gerado pela API do próprio jogo, tornando a transferência indetectável pelas varreduras conhecidas.

---

## 📂 Estrutura de Arquivos

```
syrex/
├── assets/                  # Ícones, logos e recursos gráficos
│   ├── icon.ico
│   └── logo-black.png
├── src/
│   ├── main/                # Processo Principal do Electron
│   │   ├── main.js          # Ponto de entrada do Electron
│   │   ├── adb-wrapper.js   # Gerenciador de comandos ADB
│   │   └── stealth-core.js  # Módulo de ofuscação de metadados
│   ├── renderer/            # Interface do Usuário (Frontend)
│   │   ├── index.html       # HTML da Dashboard
│   │   ├── styles.css       # Estilo All-Black Minimalista
│   │   └── app.js           # Lógica da UI e logs do console
│   └── utils/               # Utilitários e autenticação
│       ├── license.js       # Validador da API de licença
│       └── logger.js        # Formatador de logs
├── package.json
└── README.md
```

---

## ⚠️ Limitações Conhecidas

- **Conexão ADB Mandatória:** O celular físico deve manter o modo de Depuração USB ativo durante todo o procedimento.
- **Estado do Jogo:** Recomenda-se manter o Free Fire fechado no celular enquanto a cópia dos replays estiver sendo executada.
- **Padrões de Permissão Android 13+:** Em versões do Android 13 ou superiores, pode ser necessário conceder permissões extras via Shizuku ou ADB para escrita na pasta `Android/data`.
- **Evolução de Scanners:** A eficácia do Stealth Core v3 é garantida contra as assinaturas e comportamentos de scanners conhecidos até a data atual. Atualizações no sistema anti-cheat do jogo podem exigir revisões no script.

---

## ❓ Solução de Problemas (FAQ)

<details>
<summary><b>1. "Emulador não detectado" no console. O que fazer?</b></summary>

Verifique se a opção de Depuração ADB está marcada nas configurações do seu emulador (ex: LDPlayer -> Configurações de Outros -> ADB Debug: Conectar localmente). Em seguida, clique em **"Reconectar"** no SYREX.
</details>

<details>
<summary><b>2. "Celular não autorizado no ADB". Como resolver?</b></summary>

Desconecte o cabo USB do celular, reconecte e preste atenção na tela do smartphone. Uma mensagem de autorização surgirá. Marque a opção *"Sempre permitir neste computador"* e toque em **OK**.
</details>

<details>
<summary><b>3. O erro "Pasta de replays não existe" é exibido.</b></summary>

Abra o Free Fire no celular ou no emulador pelo menos uma vez e salve um replay qualquer dentro do jogo. Isso força o motor do Free Fire a criar a estrutura de diretórios necessária.
</details>

<details>
<summary><b>4. "Stealth Core não conectou" ou erro de permissão.</b></summary>

Certifique-se de que o ADB possui privilégios de escrita na memória do celular. Em aparelhos Xiaomi (MIUI/HyperOS), ative a opção *"Depuração USB (Configurações de Segurança)"* nas opções do desenvolvedor.
</details>

<details>
<summary><b>5. O arquivo foi transferido, mas não aparece na lista de replays do celular.</b></summary>

Garante que a versão do Free Fire no emulador é **exatamente idêntica** à versão instalada no celular. Replays de versões diferentes do jogo são ignorados pelo cliente.
</details>

---

## 🗺 Roadmap Futuro

- [ ] Suporte para automação via Wi-Fi ADB sem necessidade de cabo USB.
- [ ] Módulo de sincronização em lote para múltiplos replays antigos.
- [ ] Compatibilidade estendida para outros jogos (ex: Arena of Valor, PUBG Mobile).
- [ ] Dashboard com gráficos estatísticos de partidas analisadas.
- [ ] Versão web do painel para controle remoto via dispositivo móvel.

---

## 🤝 Contribuindo

Contribuições são fundamentais para a evolução da ferramenta. Siga os passos abaixo para colaborar:

1. Faça um **Fork** do projeto.
2. Crie uma branch para sua funcionalidade (`git checkout -b feature/NovaFuncionalidade`).
3. Realize os commits com mensagens claras (`git commit -m 'Adiciona suporte a novo scanner'`).
4. Envie as alterações para o repositório remoto (`git push origin feature/NovaFuncionalidade`).
5. Abra um **Pull Request**.

---

## 📝 Licença

Este projeto é distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](./LICENSE) para obter mais informações.

---

## ✉️ Contato e Redes

- **Website:** [syrex-project.com](https://example.com)
- **Discord:** [Comunidade SYREX](https://discord.gg/example)
- **Email de Suporte:** `suporte@syrex-project.com`

---

## 📊 Agradecimentos

- Aos desenvolvedores da comunidade **Electron** e **Node.js**.
- Aos contribuidores das ferramentas **Android SDK Platform-Tools**.
- À equipe de pesquisadores de segurança em sistemas Android que documentaram a estrutura de chamadas de sistema POSIX.

---

<div align="center">
  <sub>Desenvolvido com foco em alta performance e segurança por SYREX Core Team. © 2026.</sub>
</div>
