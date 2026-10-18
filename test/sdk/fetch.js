// The bot makes no outbound HTTP calls, so a test that reaches this is a test that found a bug.

export async function fetch(url) {
  throw new Error(`unexpected outbound request to ${url}`);
}

export default fetch;
