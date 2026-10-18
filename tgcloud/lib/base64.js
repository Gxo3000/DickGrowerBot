// URL-safe base64 without padding over UTF-8, written out by hand: the runtime promises neither
// `atob` nor `TextEncoder`.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export function base64UrlEncode(text) {
  const bytes = utf8Encode(text);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    const chars = i + 1 >= bytes.length ? 2 : i + 2 >= bytes.length ? 3 : 4;
    for (let j = 0; j < chars; j++) {
      out += ALPHABET[(n >> (18 - 6 * j)) & 63];
    }
  }
  return out;
}

export function base64UrlDecode(encoded) {
  return utf8Decode(base64UrlToBytes(encoded));
}

export function base64UrlToBytes(encoded) {
  const clean = encoded.replace(/=+$/, '').replaceAll('+', '-').replaceAll('/', '_');
  const bytes = [];
  let buffer = 0;
  let bits = 0;
  for (const char of clean) {
    const value = ALPHABET.indexOf(char);
    if (value < 0) throw new Error('invalid base64');
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return Uint8Array.from(bytes);
}

function utf8Encode(text) {
  const bytes = [];
  for (const char of text) {
    const code = char.codePointAt(0);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 63));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
    } else {
      bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 63), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
    }
  }
  return bytes;
}

function utf8Decode(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length;) {
    const byte = bytes[i];
    const length = byte < 0x80 ? 1 : byte < 0xe0 ? 2 : byte < 0xf0 ? 3 : 4;
    let code = length === 1 ? byte : byte & (0xff >> (length + 1));
    for (let j = 1; j < length; j++) {
      const next = bytes[i + j];
      if (next === undefined || (next & 0xc0) !== 0x80) throw new Error('invalid UTF-8');
      code = (code << 6) | (next & 63);
    }
    out += String.fromCodePoint(code);
    i += length;
  }
  return out;
}
