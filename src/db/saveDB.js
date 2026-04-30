export function saveDB(db) {
  const data = db.export(); // Uint8Array

  const binary = String.fromCharCode(...data);
  const base64 = btoa(binary);

  localStorage.setItem('lorcana_db', base64);
}