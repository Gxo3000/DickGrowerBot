import { handleInlineQuery } from '../lib/router/inline.js';

export default async function (query) {
  try {
    await handleInlineQuery(query);
  } catch (e) {
    console.error('could not handle an inline query', { uid: query.from?.id }, e);
  }
}
