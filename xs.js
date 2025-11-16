const { Telegraf, Markup } = require("telegraf");
const fs = require('fs');
const pino = require('pino');
const crypto = require('crypto');
const chalk = require('chalk');
const path = require("path");
const moment = require('moment-timezone');
const os = require('os');
const speed = require('performance-now');
const config = require("./config.js");
const si = require("systeminformation");
const fetch = require("node-fetch");
const tokens = config.tokens;
const bot = new Telegraf(tokens);
const axios = require("axios");
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const { fileTypeFromBuffer } = require("file-type");
const unzipper = require('unzipper');
const { exec } = require('child_process');
const util = require('util');
const FormData = require("form-data");
const https = require("https");

async function showStartupBanner() {
  const asciiArt = `
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣤⡶⠶⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠲⠶⣤⣤⣄⣀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⣠⣶⣿⣿⠟⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⡿⣿⣦⣄⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣰⣿⣿⢏⡔⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢎⠻⣿⣷⡄⠀⠀
⠀⠀⠀⠀⠀⣰⣿⣻⠃⡞⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡇⢹⣿⣿⡄⠀
⠀⠀⠀⠀⢰⣿⣟⡗⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠐⣛⣿⣿⠀
⠀⠀⠀⠀⢸⣿⣿⡓⠀⢳⡀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⠀⠀⠀⠀⠀⠠⢄⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⣰⠇⠐⣻⣿⣿⡆
⠀⠀⠀⠀⢸⣿⣿⡷⠖⠋⠻⣄⠀⠀⣀⣤⠶⠚⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠲⢦⣄⡀⠀⢀⣴⠏⠈⠲⢿⣿⣿⠇
⠀⠀⠀⠀⠸⣿⣿⣿⣧⠞⠁⠈⠻⢾⣏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣻⡷⠋⡁⠈⢦⣾⣿⣿⣿⠀
⠀⠀⠀⠀⠀⠹⣿⣿⣷⣷⡴⠃⠀⠀⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣧⠀⠀⠱⣴⣷⣯⣿⡿⠃⠀
⠀⠀⠀⠀⠀⠀⠙⢿⣿⣯⣾⣿⢗⣼⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣦⢾⣿⣮⣿⣿⠟⠁⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣿⡿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠳⣽⣿⣿⡍⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⣿⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡠⢸⣇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢸⡇⠀⠘⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡜⠀⠀⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠘⣇⠀⢄⣿⡰⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡴⢸⣇⠀⢀⡟⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⣾⣿⠇⠹⣶⣤⣀⣀⠀⠙⢶⣤⡀⠀⠀⠀⣠⣴⠖⠉⢀⣀⣠⣴⡾⠁⢿⣿⡆⢸⡇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢸⡀⣿⠏⢠⣾⣿⣿⣿⣿⣿⣦⡀⠹⡿⠀⠀⠸⡿⠁⣤⣾⣿⣿⣿⣿⣷⣦⠀⢿⡇⡸⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢧⢿⡀⢸⣿⣿⣿⣿⣿⣿⣿⡟⠆⠀⠀⠀⠀⠀⠞⣿⣿⣿⣿⣿⣿⣿⣿⠀⣸⢧⠇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢈⡷⠈⢿⣿⣿⣿⣿⣿⣿⡇⠀⠀⣠⣤⡀⠀⠀⣿⣿⣿⣿⣿⣿⣿⠃⠀⣏⠈⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡆⠀⠀⠀⠙⠻⠿⠿⠿⠟⠁⠀⢠⣿⣿⣧⠀⠀⠙⠿⠿⠿⠿⠛⠁⠀⠀⠀⣆⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⢻⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢷⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⢾⣿⡿⢸⣿⣿⠆⠀⠀⠀⠀⠀⠀⠀⠀⣀⣴⡟⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠛⢛⣿⣿⣿⡖⠦⡀⠀⠀⠉⠁⠀⠉⠁⠀⠀⢠⠖⣾⣿⣿⣿⠛⠛⠉⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⡇⣿⢻⣿⣴⣠⢀⠀⡄⠀⡀⢀⡄⢀⣀⣼⣼⣿⠹⡇⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠧⡇⢸⣿⣿⡇⢹⠒⡟⠙⡟⠉⡗⢹⠁⣿⣿⣿⠀⡧⠇⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢱⠀⠀⠘⢿⣹⠛⠼⣦⣿⣄⣧⣀⣷⣾⠴⢻⣸⠟⠀⠀⢠⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢧⡀⠀⠀⠊⠳⠧⣼⣠⣤⣧⣱⣸⡦⠷⠚⠃⠀⠀⣠⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠲⣤⡀⠀⠀⠀⠈⠀⠀⠈⠀⠀⠀⠀⣠⡴⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⣦⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⡟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⢷⣄⣠⣴⣶⣤⣄⣰⠿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠀⠀⠀⠀⠀⠀⠀⠀
`;

  function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  let osInfo, mem, cpu, disk, net, time;
try { osInfo = await si.osInfo(); } catch { osInfo = { distro: "Unknown", release: "Unknown" }; }
try { mem = await si.mem(); } catch { mem = { used: 0, total: 1 }; }
try { cpu = await si.cpu(); } catch { cpu = { brand: "Unknown", cores: 1 }; }
try { disk = await si.fsSize(); } catch { disk = []; }
try { net = await si.networkInterfaces(); } catch { net = []; }
try { time = await si.time(); } catch { time = { uptime: 0 }; }

  console.clear();
  console.log(chalk.cyan(asciiArt));
  console.log(chalk.cyan.bold("━━━━━━━━━━━[ BOT CONNECTED ]━━━━━━━━━━━"));
  console.log(chalk.white(`💻 OS     : ${osInfo.distro} ${osInfo.release}`));
  console.log(chalk.white(`🖥️  CPU    : ${cpu.brand} (${cpu.cores} cores)`));
  console.log(chalk.white(`📊 RAM    : ${formatBytes(mem.used)} / ${formatBytes(mem.total)}`));
  if (disk[0]) console.log(chalk.white(`💽 Disk   : ${formatBytes(disk[0].used)} / ${formatBytes(disk[0].size)}`));
  console.log(chalk.white(`⏱️ Uptime : ${formatUptime(time.uptime)}`));

  const activeNet = net.find(n => !n.virtual && n.operstate === "up");
  if (activeNet) {
    console.log(chalk.white(`🌐 Network: ${activeNet.iface} (${activeNet.ip4})`));
  }

  console.log(chalk.cyan.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(chalk.greenBright("✅ BOT IS ONLINE AND READY TO ROCK!"));
  console.log();
}

bot.launch();
showStartupBanner();
    
// --------------------- ( Bot Setting ) ---------------------- \\
  function logMessage(ctx) {
  const body = ctx.message.text || "[Non-text message]";
  const pushname = ctx.message.from.username
    ? "@" + ctx.message.from.username
    : ctx.message.from.first_name || "Tanpa Nama";
  const sender = ctx.message.from.id;
  const isGroup = ctx.chat.type.endsWith("group");
  const groupName = isGroup ? ctx.chat.title : "Private Chat";
  const from = ctx.chat.id;

  // Warna header (grup = biru, private = ungu)
  const headerColor = isGroup ? "\x1b[44m" : "\x1b[45m";

  console.log("\n\x1b[37m┌───────────────────────────────┐");
  console.log(`${headerColor}\x1b[97m   ✦ New Message Received ✦   \x1b[0m`);
  console.log("│\x1b[0m 📅 Tanggal : " + new Date().toLocaleString());
  console.log("│\x1b[0m 💬 Pesan   : " + body);
  console.log("│\x1b[0m 👤 Pengirim: " + pushname);
  console.log("│\x1b[0m 🆔 User ID : " + sender);

  if (isGroup) {
    console.log("│\x1b[0m 👥 Grup    : " + groupName);
    console.log("│\x1b[0m 🏷️ GroupID : " + from);
  }

  console.log("└───────────────────────────────┘\x1b[0m\n");
}

    function sleep(ms) 
    {
    return new Promise(resolve => setTimeout(resolve, ms));
    }
            
const ownersFile = path.join(__dirname, "database", "owner.json");

function getOwners() {
  let extraOwners = [];
  if (fs.existsSync(ownersFile)) {
    try {
      extraOwners = JSON.parse(fs.readFileSync(ownersFile));
    } catch { extraOwners = []; }
  }

  const configOwners = Array.isArray(config.owner) ? config.owner : [config.owner];

  return [...new Set([
    ...configOwners.map(String),
    ...extraOwners.map(String),
  ])];
}

// Cek apakah user adalah owner
function isOwner(userId) {
  return getOwners().includes(String(userId));
}

// Tambah owner baru
function addOwner(userId) {
  let owners = [];
  if (fs.existsSync(ownersFile)) {
    owners = JSON.parse(fs.readFileSync(ownersFile));
  }
  if (!owners.includes(String(userId))) {
    owners.push(String(userId));
    fs.writeFileSync(ownersFile, JSON.stringify(owners, null, 2));
  }
  return owners;
}

// Hapus owner
function delOwner(userId) {
  let owners = [];
  if (fs.existsSync(ownersFile)) {
    owners = JSON.parse(fs.readFileSync(ownersFile));
  }
  owners = owners.filter(o => o !== String(userId));
  fs.writeFileSync(ownersFile, JSON.stringify(owners, null, 2));
  return owners;
}

async function getOwnersWithUsername(bot) {
  const owners = getOwners();
  const result = [];

  for (let id of owners) {
    try {
      const chat = await bot.telegram.getChat(id);
      if (chat.username) {
        result.push(`@${chat.username} (${id})`);
      } else {
        result.push(id);
      }
    } catch {
      result.push(id);
    }
  }

  return result;
}
             
    // === [ VARIABEL WAKTU ] === \\
    const time = moment.tz("Asia/Makassar").format("HH:mm:ss");
    const currentDate = new Date();
    const dayOfWeek = currentDate.toLocaleString('default', { weekday: 'long' });
    const todayDateWIB = new Date().toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    });

    let timestamp = speed();
    let latensii = speed() - timestamp;
    
    const { runtime, formatSize } = require("./lib/function")
                
bot.on("message", async (ctx, next) => {
    logMessage(ctx);
    const text = ctx.message?.text || ""
    const msg = ctx.message
    const args = text.trim().split(" ").slice(1);
    // ✅ baru
    const chatType = ctx.chat?.type || ctx.update.callback_query?.message?.chat?.type || null;
    const pushname = ctx.from?.username || ctx.from?.first_name || "User";
    
    const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

// ✅ Multi-prefix support
const prefixes = ["/", "!", ".", ",", "🐤", "🗿"];

let rawCmd = text.trim().split(" ")[0].toLowerCase();
let usedPrefix = "";
let cmd = rawCmd;

for (const p of prefixes) {
  if (rawCmd.startsWith(p)) {
    usedPrefix = p;
    cmd = rawCmd.slice(p.length);
    break;
  }
}

if (!usedPrefix) {
  usedPrefix = "";
}
    const userId = ctx.from.id;
    
    switch (cmd) {
        case "start": {
  const bruh = ctx.from;
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const formattedUsedMem = formatSize(usedMem);
  const formattedTotalMem = formatSize(totalMem);

  const imageUrl = "https://files.catbox.moe/k3nvc4.png"; // <-- GANTI URL FOTO DI SINI

  let ligma = `👋 Hi @${pushname},  
🤖 i am an automated system (Telegram Bot Base)

📌 Info Sistem:
 ▢ 🆔 ID : ${bruh.id}
 ▢ 🧩 Version : ${require('./package.json').version}
 ▢ 🖥️ RAM : ${formattedUsedMem} / ${formattedTotalMem}
 ▢ 📅 Hari : ${dayOfWeek}
 ▢ 🗓️ Tanggal : ${todayDateWIB}
 ▢ ⏰ Waktu : ${time} (Asia/Jakarta)
 ▢ ⚡ Speed : ${latensii.toFixed(4)} Sec
 ▢ 🔄 Run Time : ${runtime(process.uptime())}
 
 ©️ Simple Base Bot by Than XS`;

  const sent = await ctx.replyWithPhoto(
    { url: imageUrl },
    {
      caption: ligma,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "System", callback_data: "system" }],
          [{ text: "Owner", url: "https://t.me/thanror" }],
          [{ text: "Channel", url: "https://t.me/thanofficial" }]
        ]
      }
    }
  );

  return;
}
    
case "menu":
case "allmenu": {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const formattedUsedMem = formatSize(usedMem);
  const formattedTotalMem = formatSize(totalMem);

  // FOTO (GANTI DI SINI)
  const imageUrl = "https://files.catbox.moe/k3nvc4.png";

  let shit = `Hi @${pushname}, let me introduce myself, i am thanbot base
      
 ▢ Ram : ${formattedUsedMem} / ${formattedTotalMem}
 ▢ Speed : ${latensii.toFixed(4)} Sec
 ▢ Run Time : ${runtime(process.uptime())}

┌──────
├─── ▢ System & info
├─ ping
├─ getid
└

©️ Simple Base Bot by Than XS`;

  await ctx.replyWithPhoto(
    { url: imageUrl }, // <-- FOTO
    {
      caption: shit,
      reply_markup: {
        inline_keyboard: [
          [{ text: "channel", url: "https://t.me/thanofficial" }]
        ],
      },
    }
  );

  return;
}

case "addowner": {
    if (!isOwner(ctx.from.id)) return ctx.reply("❌ Hanya owner yang bisa menambah owner.");
    if (!args[0]) return ctx.reply(`⚠️ Masukkan ID user.\nExample : ${usedPrefix + cmd} 123456789`);

    const newOwnerId = args[0].trim();
    const owners = addOwner(newOwnerId);
    ctx.reply(
      `✅ Owner baru berhasil ditambahkan: \`${newOwnerId}\`\n👑 Total owner: ${owners.length}`,
      { parse_mode: "Markdown" }
    );
  return;
            }

  case "delowner": {
    if (!isOwner(ctx.from.id)) return ctx.reply("❌ Hanya owner yang bisa menghapus owner.");
    if (!args[0]) return ctx.reply(`⚠️ Masukkan ID user.\nExample : ${usedPrefix + cmd} 123456789`);

    const delOwnerId = args[0].trim();
    const owners = delOwner(delOwnerId);
    ctx.reply(
      `🗑️ Owner berhasil dihapus: \`${delOwnerId}\`\n👑 Total owner: ${owners.length}`,
      { parse_mode: "Markdown" }
    );
return; 
            }

  case "listowner": {
  try {
    if (!isOwner(ctx.from.id))
      return await ctx.reply("❌ Hanya owner yang bisa melihat list semua owner.");

    const ownersList = await getOwnersWithUsername(bot);

    const escapeHTML = (s) =>
      String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const title = "👑 Daftar Owner:";
    const list = ownersList.map((o, i) => `${i + 1}. ${escapeHTML(o)}`).join("\n");
    const finalText = `${title}\n${list}`;

    return await ctx.reply(finalText, { parse_mode: "HTML" });
  } catch (err) {
    console.error(err);
    return await ctx.reply("❌ Terjadi kesalahan saat menampilkan daftar owner.");
  }
}
break;
    
case "info":
case "id":
case "getid": {
  try {
    let target = ctx.from; // default user pengirim
    let text = ctx.message.text?.trim().split(" ").slice(1).join(" "); // ambil argumen setelah /id
    let caption;

    if (ctx.message?.reply_to_message) {
      target = ctx.message.reply_to_message.from;
      caption = `🆔 *User ID*: \`${target.id}\`\n👤 Nama: ${target.first_name || ""} ${target.last_name || ""}`;
      if (target.username) caption += `\n🔗 Username: @${target.username}`;
    }

    else if (text) {
      const username = text.replace("@", "");
      let userInfo = null;

      try {
        userInfo = await ctx.telegram.getChat(`@${username}`);
      } catch (e) {
        console.error("❌ Gagal ambil ID:", e.message);
        return ctx.reply(`⚠️ Tidak dapat menemukan user dengan username *@${username}*`, {
          parse_mode: "Markdown",
        });
      }

      caption = `🆔 *User ID*: \`${userInfo.id}\`\n👤 Nama: ${userInfo.first_name || ""} ${userInfo.last_name || ""}`;
      if (userInfo.username) caption += `\n🔗 Username: @${userInfo.username}`;
    }
    else {
      caption = `🆔 *User ID*: \`${target.id}\`\n👤 Nama: ${target.first_name || ""} ${target.last_name || ""}`;
      if (target.username) caption += `\n🔗 Username: @${target.username}`;
    }

    if (["group", "supergroup"].includes(ctx.chat?.type)) {
      caption += `\n💬 *Chat ID*: \`${ctx.chat.id}\``;
    }

    return ctx.reply(caption, { parse_mode: "Markdown" });
  } catch (err) {
    console.error("❌ Error mengambil id:", err);
    return ctx.reply("⚠️ Terjadi kesalahan saat memproses perintah ini.");
  }
}
break;

case "ping": {
  const os = require("os");
  const nou = require("node-os-utils");
  const speed = require("performance-now");

  const timestamp = speed();

  try {
    // info OS
    const tot = await nou.drive.info();
    const memInfo = await nou.mem.info();
    const totalGB = (memInfo.totalMemMb / 1024).toFixed(2);
    const usedGB = (memInfo.usedMemMb / 1024).toFixed(2);
    const freeGB = (memInfo.freeMemMb / 1024).toFixed(2);
    const cpuCores = os.cpus().length;
    const vpsUptime = runtime(os.uptime());
    const botUptime = runtime(process.uptime());
    const latency = (speed() - timestamp).toFixed(4);

    const respon = `
📡 *Server Information*
• 🖥️ OS Platform: ${nou.os.type()}
• 💾 RAM: ${usedGB}/${totalGB} GB used (${freeGB} GB free)
• 🗄️ Disk Space: ${tot.usedGb}/${tot.totalGb} GB used
• 🔢 CPU Cores: ${cpuCores} Core(s)
• ⏱️ VPS Uptime: ${vpsUptime}

🤖 *Bot Information*
• ⚡ Response Time: ${latency} sec
• 🔋 Bot Uptime: ${botUptime}
• 🧠 CPU: ${os.cpus()[0].model}
• 🏷️ Architecture: ${os.arch()}
• 🏠 Hostname: ${os.hostname()}
`;

    await ctx.reply(respon, { parse_mode: "Markdown" });
  } catch (e) {
    await ctx.reply(`❌ Gagal mengambil info server: ${e.message}`);
  }

  return; // Stop eksekusi case lain
}
}
});

bot.on("callback_query", async (ctx) => {
    const data = ctx.callbackQuery?.data;
    if (!data) return;
    const userId = ctx.from.id.toString();
    const chatType = ctx.chat?.type || ctx.update.callback_query?.message?.chat?.type || null;
    const pushname = ctx.from?.username || ctx.from?.first_name || "User";
    const userName = ctx.from?.first_name || ctx.from?.username || "Customer";
    const parts = data.split(" ");
    const cmd = `/${parts[0]}`;
    const arg = parts.slice(1).join(" ");
    await ctx.answerCbQuery();
    
    switch(data) {
    case "back_start": {
  const bruh = ctx.from;
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const formattedUsedMem = formatSize(usedMem);
  const formattedTotalMem = formatSize(totalMem);

  // FOTO (GANTI DI SINI)
  const imageUrl = "https://files.catbox.moe/k3nvc4.png";

  let ligma = `👋 Hi @${pushname},  
🤖 I am an automated system (Telegram Bot Base)

📌 Info Sistem:
 ▢ 🆔 ID : ${bruh.id}
 ▢ 🧩 Version : ${require('./package.json').version}
 ▢ 🖥️ RAM : ${formattedUsedMem} / ${formattedTotalMem}
 ▢ 📅 Hari : ${dayOfWeek}
 ▢ 🗓️ Tanggal : ${todayDateWIB}
 ▢ ⏰ Waktu : ${time} (Asia/Jakarta)
 ▢ ⚡ Speed : ${latensii.toFixed(4)} Sec
 ▢ 🔄 Run Time : ${runtime(process.uptime())}
 
 ©️ Simple Base Bot by Than XS`;

  return ctx.editMessageMedia(
    {
      type: "photo",
      media: imageUrl, // ← Foto
      caption: ligma,
      parse_mode: "Markdown"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Menu", callback_data: "menu" }],
          [{ text: "Owner", url: "https://t.me/thanror" }],
          [{ text: "Channel", url: "https://t.me/thanofficial" }]
        ]
      }
    }
  );
}

case "system": {
  const bruh = ctx.from;
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const formattedUsedMem = formatSize(usedMem);
  const formattedTotalMem = formatSize(totalMem);

  // FOTO (GANTI URL DI SINI)
  const imageUrl = "https://files.catbox.moe/k3nvc4.png";

  let shit = `👋 Hi @${pushname},  
🤖 I am an automated system (Telegram Bot Base)

📌 Info Sistem:
 ▢ 🆔 ID : ${bruh.id}
 ▢ 🧩 Version : ${require('./package.json').version}
 ▢ 🖥️ RAM : ${formattedUsedMem} / ${formattedTotalMem}
 ▢ 📅 Hari : ${dayOfWeek}
 ▢ 🗓️ Tanggal : ${todayDateWIB}
 ▢ ⏰ Waktu : ${time} (Asia/Jakarta)
 ▢ ⚡ Speed : ${latensii.toFixed(4)} Sec
 ▢ 🔄 Run Time : ${runtime(process.uptime())}
 
 ©️ Simple Base Bot by Than XS`;

  return ctx.editMessageMedia(
    {
      type: "photo",
      media: imageUrl, // ← foto
      caption: shit,
      parse_mode: "Markdown"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Menu", callback_data: "menu" }],
          [{ text: "Owner Menu", callback_data: "ownermenu" }],
          [{ text: "⌫ Back to Menu", callback_data: "back_start" }]
        ]
      }
    }
  );
}
    
    case "ownermenu": {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const formattedUsedMem = formatSize(usedMem);
      const formattedTotalMem = formatSize(totalMem);
      
      // FOTO (GANTI URL DI SINI)
      const imageUrl = "https://files.catbox.moe/k3nvc4.png";

      let shit = `👋 Hi @${pushname},  
🤖 i am an automated system (Telegram Bot Base)
      
 ▢ Ram : ${formattedUsedMem} / ${formattedTotalMem}
 ▢ Speed : ${latensii.toFixed(4)} Sec
 ▢ Run Time : ${runtime(process.uptime())}

┌──────
├─── ▢ Owner
├─ addowner
├─ delowner
├─ listowner
└

©️ Simple Base Bot by Than XS`;

      return ctx.editMessageMedia(
    {
      type: "photo",
      media: imageUrl, // ← foto
      caption: shit,
      parse_mode: "Markdown"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⌫ Back to Menu", callback_data: "back_start" }]
        ]
      }
    }
  );

      break;
    }
    
        case "menu": {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const formattedUsedMem = formatSize(usedMem);
      const formattedTotalMem = formatSize(totalMem);
      
      // FOTO (GANTI URL DI SINI)
      const imageUrl = "https://files.catbox.moe/k3nvc4.png";

      let shit = `👋 Hi @${pushname},  
🤖 i am an automated system (Telegram Bot Base)
      
 ▢ Ram : ${formattedUsedMem} / ${formattedTotalMem}
 ▢ Speed : ${latensii.toFixed(4)} Sec
 ▢ Run Time : ${runtime(process.uptime())}

┌──────
├─── ▢ System & info
├─ ping
├─ getid
└

©️ Simple Base Bot by Than XS`;

      return ctx.editMessageMedia(
    {
      type: "photo",
      media: imageUrl, // ← foto
      caption: shit,
      parse_mode: "Markdown"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⌫ Back to Menu", callback_data: "back_start" }]
        ]
      }
    }
  );

      break;
    }
    }
});