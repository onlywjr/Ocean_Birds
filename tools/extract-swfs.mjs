import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync, inflateSync } from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'source', '_bird');
const outputDir = path.join(root, 'assets', 'flash-source', 'decoded');

function readTags(body) {
  const rectBytes = Math.ceil((5 + 4 * (body[0] >>> 3)) / 8);
  let offset = rectBytes + 4;
  let jpegTables;
  const images = [];
  const lossless = [];

  while (offset + 2 <= body.length) {
    const header = body.readUInt16LE(offset);
    offset += 2;
    const code = header >>> 6;
    let length = header & 63;
    if (length === 63) {
      length = body.readUInt32LE(offset);
      offset += 4;
    }
    const end = offset + length;
    if (end > body.length) throw new Error(`SWF tag ${code} extends past the file`);
    if (code === 8) jpegTables = body.subarray(offset, end);
    if (code === 6 || code === 21) {
      const id = body.readUInt16LE(offset);
      images.push({ id, code, data: body.subarray(offset + 2, end) });
    }
    if (code === 36) {
      const id = body.readUInt16LE(offset);
      const format = body[offset + 2];
      const width = body.readUInt16LE(offset + 3);
      const height = body.readUInt16LE(offset + 5);
      const tableSize = format === 3 ? body[offset + 7] + 1 : 0;
      lossless.push({ id, format, width, height, tableSize, data: body.subarray(offset + (format === 3 ? 8 : 7), end) });
    }
    offset = end;
    if (code === 0) break;
  }
  return { jpegTables, images, lossless };
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const name = Buffer.from(type, 'ascii');
  const content = Buffer.concat([name, data]);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  content.copy(out, 4);
  out.writeUInt32BE(crc32(content), 8 + data.length);
  return out;
}

function losslessPng(bitmap) {
  if (bitmap.format !== 3) return null;
  const raw = inflateSync(bitmap.data);
  const paletteBytes = bitmap.tableSize * 4;
  const rowBytes = Math.ceil(bitmap.width / 4) * 4;
  const rgba = Buffer.alloc(bitmap.width * bitmap.height * 4);
  for (let y = 0; y < bitmap.height; y++) {
    for (let x = 0; x < bitmap.width; x++) {
      const colorIndex = raw[paletteBytes + y * rowBytes + x];
      const source = colorIndex * 4;
      const target = (y * bitmap.width + x) * 4;
      rgba[target] = raw[source];
      rgba[target + 1] = raw[source + 1];
      rgba[target + 2] = raw[source + 2];
      rgba[target + 3] = raw[source + 3];
    }
  }
  const scanlines = Buffer.alloc((bitmap.width * 4 + 1) * bitmap.height);
  for (let y = 0; y < bitmap.height; y++) {
    const row = y * (bitmap.width * 4 + 1);
    scanlines[row] = 0;
    rgba.copy(scanlines, row + 1, y * bitmap.width * 4, (y + 1) * bitmap.width * 4);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(bitmap.width, 0);
  header.writeUInt32BE(bitmap.height, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(scanlines)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

const files = (await fs.readdir(sourceDir)).filter(file => file.endsWith('.swf') && file !== 'main-page.swf');
let extracted = 0;

for (const file of files) {
  const source = await fs.readFile(path.join(sourceDir, file));
  const signature = source.toString('ascii', 0, 3);
  if (signature !== 'FWS' && signature !== 'CWS') throw new Error(`${file}: unsupported SWF signature ${signature}`);
  const body = signature === 'CWS' ? inflateSync(source.subarray(8)) : source.subarray(8);
  const { jpegTables, images, lossless } = readTags(body);
  if (!images.length && !lossless.length) continue;

  const pageDir = path.join(outputDir, path.basename(file, '.swf'));
  await fs.mkdir(pageDir, { recursive: true });
  for (const image of images) {
    let data = image.data;
    if (image.code === 6 && jpegTables?.length >= 4 && data[0] === 0xff && data[1] === 0xd8) {
      data = Buffer.concat([jpegTables.subarray(0, -2), data.subarray(2)]);
    }
    await fs.writeFile(path.join(pageDir, `bitmap_${image.id}.jpg`), data);
    extracted++;
  }
  for (const bitmap of lossless) {
    const png = losslessPng(bitmap);
    if (!png) continue;
    await fs.writeFile(path.join(pageDir, `lossless_${bitmap.id}.png`), png);
    extracted++;
  }
}

console.log(`Extracted ${extracted} raster images from linked SWFs into assets/flash-source/decoded/<page>/.`);

