import { fetchRegistry, allResources } from "../registry.js";

export async function searchCommand(query: string): Promise<void> {
  const q = query.toLowerCase();
  const reg = await fetchRegistry();
  const hits = allResources(reg).filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
  );

  if (hits.length === 0) {
    console.log(`No resources match "${query}".`);
    return;
  }
  for (const r of hits) console.log(`${r.type.padEnd(7)} ${r.name}`);
}
