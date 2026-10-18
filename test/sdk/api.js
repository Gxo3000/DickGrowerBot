// An offline stand-in for the platform's `sdk/api`. Every call is recorded; a method answers with
// what a test registered for it, or with a plausible default.

export class BotApiError extends Error {
  constructor(method, code, description, parameters = {}) {
    super(`${method}: ${code} ${description}`);
    this.method = method;
    this.code = code;
    this.description = description;
    this.parameters = parameters;
  }
}

export const BOT = { id: 4242, is_bot: true, first_name: 'Grower', username: 'TestGrowerBot' };

const calls = [];
const handlers = new Map();
let nextMessageId = 1000;

export function resetApi() {
  calls.length = 0;
  handlers.clear();
  nextMessageId = 1000;
}

export function apiCalls(method) {
  return method ? calls.filter((call) => call.method === method) : [...calls];
}

// `handler(params)` answers `method`; a thrown `BotApiError` reaches the caller as it would from
// the real Bot API.
export function onApi(method, handler) {
  handlers.set(method, handler);
}

function defaultAnswer(method, params) {
  switch (method) {
    case 'getMe':
      return BOT;
    case 'sendMessage':
    case 'copyMessage':
      return {
        message_id: nextMessageId++,
        date: Math.floor(Date.now() / 1000),
        chat: { id: params.chat_id },
        text: params.text,
      };
    case 'sendDice':
      return {
        message_id: nextMessageId++,
        chat: { id: params.chat_id },
        dice: { emoji: params.emoji ?? '🎲', value: 1 + Math.floor(Math.random() * 6) },
      };
    case 'getChatAdministrators':
      return [];
    case 'getChatMember':
      return { status: 'member', user: { id: params.user_id } };
    default:
      return true;
  }
}

export const api = new Proxy({}, {
  get(_, method) {
    if (typeof method !== 'string') return undefined;
    return async (params = {}) => {
      calls.push({ method, params });
      const handler = handlers.get(method);
      return handler ? handler(params) : defaultAnswer(method, params);
    };
  },
});

export default api;
