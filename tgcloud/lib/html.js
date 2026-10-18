export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function userLink(uid, name) {
  return `<a href="tg://user?id=${uid}">${escapeHtml(name)}</a>`;
}

export function fullName(user) {
  return user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
}

export function signed(value) {
  return value > 0 ? `+${value}` : String(value);
}

export function percentage(won, total) {
  return total > 0 ? `${Math.round((won / total) * 100)}%` : '0%';
}

export function floatPercentage(ratio) {
  return `${(ratio * 100).toFixed(2)}%`;
}
