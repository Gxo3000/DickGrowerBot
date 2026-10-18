import { config } from '../config.js';
import { countRequests } from '../repo/state.js';

// Counts a request of the user in the chat. Returns null while both are within their limits;
// otherwise whether the request should still be told so. A store that can't be asked lets the
// request through.
export async function overLimit(uid, chatKey) {
  const { userRequests, chatRequests, windowSeconds, warnings } = config.rateLimit;
  const limits = {};
  if (userRequests > 0) limits[`u:${uid}`] = userRequests;
  if (chatRequests > 0 && chatKey) limits[`c:${chatKey}`] = chatRequests;
  const keys = Object.keys(limits);
  if (keys.length === 0) return null;
  try {
    const counts = await countRequests(keys, windowSeconds);
    const over = Math.max(...keys.map((key) => (counts[key] ?? 0) - limits[key]));
    return over > 0 ? { warn: over <= warnings } : null;
  } catch (e) {
    console.warn('could not count the request', e);
    return null;
  }
}
