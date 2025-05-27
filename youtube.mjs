import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Downloads audio/video from YouTube
 * @param {string} query
 * @param {'mp3'|'mp4'} format
 * @returns {Promise<string>}
 */
export async function downloadFromYoutube(query, format = 'mp3') {
  const downloadFolder = path.resolve('./downloads');
  if (!fs.existsSync(downloadFolder)) {
    fs.mkdirSync(downloadFolder, { recursive: true });
  }

  const timestamp = Date.now();
  const outputTemplate = path.join(downloadFolder, `%(title)s-${timestamp}.%(ext)s`);

  const ffmpegPath = path.resolve(
    'C:/Users/Administrator/Desktop/ffmpeg-7.1.1-full_build/bin'
  );

  let cmd;
  if (format === 'mp3') {
    cmd = `yt-dlp "ytsearch1:${query}" --extract-audio --audio-format mp3 --audio-quality 0 --output "${outputTemplate}" --ffmpeg-location "${ffmpegPath}" --quiet --no-warnings`;
  } else if (format === 'mp4') {
    cmd = `yt-dlp "ytsearch1:${query}" -f "mp4" --output "${outputTemplate}" --ffmpeg-location "${ffmpegPath}" --quiet --no-warnings`;
  } else {
    throw new Error('Unsupported format. Use "mp3" or "mp4".');
  }

  try {
    await execAsync(cmd);
  } catch (error) {
    console.error('yt-dlp execution failed:', error.stderr || error.message);
    throw new Error(`yt-dlp failed: ${error.message}`);
  }

  const downloadedFiles = fs
    .readdirSync(downloadFolder)
    .filter(f => f.includes(`${timestamp}`) && f.toLowerCase().endsWith(`.${format}`));

  if (downloadedFiles.length === 0) {
    throw new Error('Download completed but no matching file was found.');
  }

  const originalPath = path.join(downloadFolder, downloadedFiles[0]);

  if (format === 'mp3') {
    const safePath = path.join(downloadFolder, `safe-${timestamp}.mp3`);
    const ffmpegCmd = `"${ffmpegPath}/ffmpeg" -y -i "${originalPath}" -vn -ar 44100 -ac 1 -codec:a libmp3lame -b:a 96k -f mp3 "${safePath}"`;

    try {
      await execAsync(ffmpegCmd);
      fs.unlinkSync(originalPath); 
      return safePath;
    } catch (ffmpegErr) {
      console.error('FFmpeg re-encode failed:', ffmpegErr.stderr || ffmpegErr.message);
      throw new Error('Failed to re-encode audio for WhatsApp.');
    }
  }


  return originalPath;
}
