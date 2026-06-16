import { fetchRegistry } from "../registry.js";

export async function searchCommand(query: string): Promise<void> {
  const q = query.toLowerCase();
  const reg = await fetchRegistry();
  const hits = reg.skills.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
  );

  if (hits.length === 0) {
    console.log(`No skills match "${query}".`);
    return;
  }
  for (const s of hits) console.log(s.name);
}
