// Small shared rendering helpers (dependency-free).

export function esc(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Escape a value for safe embedding inside an HTML attribute that holds JSON.
export function attrJSON(obj) {
  return esc(JSON.stringify(obj));
}

export function has(arr) {
  return Array.isArray(arr) && arr.length > 0;
}
