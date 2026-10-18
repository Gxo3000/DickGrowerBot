import { api } from 'sdk';
import { handleCallback } from '../lib/router/callback.js';

export default async function (query) {
  try {
    await handleCallback(query);
  } catch (e) {
    console.error('could not handle a callback query', { data: query.data, uid: query.from?.id }, e);
    await api.answerCallbackQuery({ callback_query_id: query.id }).catch(() => {});
  }
}
