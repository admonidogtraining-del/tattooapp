export interface SavedDesign {
  id: string;
  style: string;
  imageUrl: string;
  rating: number;
  prompt: string;
  savedAt: number;
  /** e.g. "blackwork_8_031526" */
  name: string;
}

type Collection = Record<string, SavedDesign[]>;

const STORAGE_KEY = 'inksight_collection';

export function getCollection(): Collection {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveDesign(design: Omit<SavedDesign, 'id' | 'name' | 'savedAt'>): SavedDesign {
  const collection = getCollection();
  const savedAt = Date.now();
  const id = `${design.style}_${savedAt}`;
  const date = new Date(savedAt);
  const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(date.getFullYear()).slice(2)}`;
  const name = `${design.style}_${design.rating}_${dateStr}`;
  const saved: SavedDesign = { ...design, id, name, savedAt };
  collection[design.style] = [saved, ...(collection[design.style] ?? [])];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
  return saved;
}

export function deleteDesign(style: string, id: string): void {
  const collection = getCollection();
  if (!collection[style]) return;
  collection[style] = collection[style].filter(d => d.id !== id);
  if (collection[style].length === 0) delete collection[style];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
}
