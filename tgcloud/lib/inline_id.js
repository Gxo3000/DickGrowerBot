import { base64UrlToBytes } from './base64.js';

const SUPERGROUP_SHIFT = -1000000000000;

// The supergroup an inline message was sent to, read out of its `inline_message_id`, or null when
// the id names no supergroup or can't be read. The layout is Telegram's and undocumented:
// (dc_id, message_id, chat_id: i32, access_hash) or (dc_id, chat_id: i64, message_id, access_hash).
export function chatIdOfInlineMessage(inlineMessageId) {
  try {
    const bytes = base64UrlToBytes(inlineMessageId);
    let chatId;
    if (inlineMessageId.length === 27 && bytes.length >= 20) {
      chatId = readInt32(bytes, 8);
    } else if (inlineMessageId.length === 32 && bytes.length >= 24) {
      chatId = readInt64(bytes, 4);
    } else {
      return null;
    }
    return chatId < 0 ? SUPERGROUP_SHIFT + chatId : null;
  } catch {
    return null;
  }
}

function readInt32(bytes, offset) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24));
}

function readInt64(bytes, offset) {
  const low = readInt32(bytes, offset) >>> 0;
  const high = readInt32(bytes, offset + 4);
  return high * 2 ** 32 + low;
}
