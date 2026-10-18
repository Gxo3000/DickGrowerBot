import { sql } from 'sdk/db';

// The fragments separated by commas, for a VALUES list or an IN list.
export function joinFragments(fragments) {
  return fragments.reduce((joined, fragment, i) => (i === 0 ? fragment : sql`${joined}, ${fragment}`), sql``);
}

export function chunks(items, size) {
  const result = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}
