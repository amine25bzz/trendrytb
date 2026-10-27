export async function load() {
  const res = await fetch('/api/trends');
  return res.json();
}
