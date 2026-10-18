// Time in UTC. A "day" is the number of whole days since the Unix epoch, the calendar every
// once-a-day rule of the game counts in.

export const DAY_SECONDS = 86400;

export const clock = {
  now: () => Date.now(),
};

export function nowSec() {
  return Math.floor(clock.now() / 1000);
}

export function today() {
  return dayOf(nowSec());
}

export function dayOf(unixSeconds) {
  return Math.floor(unixSeconds / DAY_SECONDS);
}

export function secondsTillNextDay() {
  return (today() + 1) * DAY_SECONDS - nowSec();
}

export function formatDay(day) {
  return new Date(day * DAY_SECONDS * 1000).toISOString().slice(0, 10);
}

export function formatDate(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
}

export function splitDuration(seconds) {
  const total = Math.max(0, Math.ceil(seconds / 60));
  return { hours: Math.floor(total / 60), minutes: total % 60 };
}
