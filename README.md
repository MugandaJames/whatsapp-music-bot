# WhatsApp Music Bot

A WhatsApp bot that lets users search and download music or videos from YouTube directly through WhatsApp messages. Powered by Baileys (WhatsApp Web API), Gemini API for chat responses, and yt-dlp for media downloads.

---

## Features

- 🎵 Search and download YouTube audio (MP3) or video (MP4) by simply sending commands.
- 🤖 Chat with Gemini AI using the `!ask` command.
- 🏓 Ping command for bot responsiveness check.
- Voice note style audio sending for a seamless WhatsApp experience.
- Automatic QR code generation for WhatsApp authentication.
- Auto reconnect on disconnect.

---

## Commands

| Command           | Description                                   | Example                          |
|-------------------|-----------------------------------------------|---------------------------------|
| `ping`            | Bot replies with "pong 🏓" to check connectivity. | `ping`                          |
| `!ask <query>`    | Ask Gemini AI any question.                    | `!ask What is AI?`              |
| `!yt <query> [mp3|mp4]` | Search and download YouTube audio/video. Default is MP3. | `!yt risky popcaan mp3` or `!yt funny cats mp4` |

---

## Conversing with Gemini AI

You can interact with the bot to get AI-generated responses via the Gemini API.  
Just send a message starting with `!ask` followed by your question or prompt:

- **Example:**  
!ask How does quantum computing work?



The bot will forward your question to Gemini AI and reply back with the generated answer.

---

## Setup & Usage

### Prerequisites

- Node.js (v18+ recommended)  
- ffmpeg installed and accessible (set path in `youtube.mjs`)  
- Git installed (optional but recommended)  

### Installation

1. Clone the repo:

 ```bash
 git clone https://github.com/yourusername/whatsapp-music-bot.git
 cd whatsapp-music-bot
