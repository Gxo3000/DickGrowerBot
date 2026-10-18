export const rng = {
  next: () => Math.random(),
};

export function randomInt(min, max) {
  return min + Math.floor(rng.next() * (max - min + 1));
}

export function chance(probability) {
  return rng.next() < probability;
}

export function pickOne(items) {
  return items[Math.floor(rng.next() * items.length)];
}

export function pickWeighted(items, weightOf) {
  const weights = items.map(weightOf);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) {
    return pickOne(items);
  }
  let point = rng.next() * total;
  for (let i = 0; i < items.length; i++) {
    point -= weights[i];
    if (point < 0) return items[i];
  }
  return items[items.length - 1];
}
