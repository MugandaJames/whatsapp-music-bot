import { askGemini } from './gemini.mjs';
import { downloadFromYoutube } from './youtube.mjs';
import fs from 'fs';
import baileys from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import path from 'path';

const { makeWASocket, useMultiFileAuthState, DisconnectReason } = baileys;

const authFolder = './auth_info_baileys';
if (!existsSync(authFolder)) mkdirSync(authFolder);
const { state, saveCreds } = await useMultiFileAuthState(authFolder);

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('📱 Scan this QR code:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error instanceof Boom &&
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;

      console.log('Connection closed. Reconnecting?', shouldReconnect);
      if (shouldReconnect) startBot();
    }

    if (connection === 'open') {
      console.log('Connected to WhatsApp!');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    console.log('Incoming message:', messages);
    const msg = messages[0];
    if (!msg?.message) return;

    const sender = msg.key.remoteJid;
    const text =
      msg.message.conversation || msg.message?.extendedTextMessage?.text;

    if (!text) return;

    const lower = text.toLowerCase();

    //  Ping response
    if (lower === 'ping') {
      console.log('Responding to ping');
      await sock.sendMessage(sender, { text: 'pong' });
    }

    //  Ask Gemini
    if (lower.startsWith('!ask')) {
      const prompt = text.slice(4).trim();
      if (!prompt) {
        await sock.sendMessage(sender, {
          text: '❗ Send your message like this: !ask What is AI?',
        });
      } else {
        console.log('Asking Gemini:', prompt);
        const reply = await askGemini(prompt);
        await sock.sendMessage(sender, { text: reply });
      }
    }

    // YouTube Download
    if (lower.startsWith('!yt')) {
      const parts = text.slice(3).trim().split(' ');
      let format = 'mp3'; 

      if (parts.length > 1) {
        const lastWord = parts[parts.length - 1].toLowerCase();
        if (lastWord === 'mp3' || lastWord === 'mp4') {
          format = lastWord;
          parts.pop();
        }
      }

      const query = parts.join(' ');
      if (!query) {
        await sock.sendMessage(sender, {
          text: 'Send your query like this: !yt risky popcaan [mp3|mp4]',
        });
        return;
      }

      await sock.sendMessage(sender, { text: '⏬ Searching and downloading...' });

      try {
        const filePath = await downloadFromYoutube(query, format);
        const fileName = path.basename(filePath);
        const fileExists = existsSync(filePath);
        const fileSize = fileExists ? (await fs.promises.stat(filePath)).size : 0;

        console.log('Sending file:', filePath);
        console.log('File exists:', fileExists);
        console.log('File size (bytes):', fileSize);

        if (!fileExists) throw new Error('Downloaded file not found');

        const fileBuffer = readFileSync(filePath);

        if (format === 'mp3') {
          await sock.sendMessage(sender, {
            audio: fileBuffer,
            mimetype: 'audio/mpeg',
            ptt: true, 
          });
        } else if (format === 'mp4') {
          await sock.sendMessage(sender, {
            video: fileBuffer,
            mimetype: 'video/mp4',
            caption: fileName,
          });
        }

        console.log(` Sent ${format}: ${fileName}`);
      } catch (error) {
        console.error('YouTube download error:', error);
        await sock.sendMessage(sender, {
          text: 'Failed to download or send the media. Try again.',
        });
      }
    }
  });
}

startBot();
