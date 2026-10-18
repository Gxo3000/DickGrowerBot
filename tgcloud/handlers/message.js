import { handleMessage } from '../lib/router/message.js';

export default async function (message) {
  try {
    await handleMessage(message);
  } catch (e) {
    console.error('could not handle a message', { chatId: message.chat?.id, messageId: message.message_id }, e);
  }
}
