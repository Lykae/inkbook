export function loadDB(SQL) {
  const saved = localStorage.getItem('lorcana_db');
  if (!saved) return null;

  const binary = atob(saved);
  const bytes = new Uint8Array([...binary].map(c => c.charCodeAt(0)));

  return new SQL.Database(bytes);
}