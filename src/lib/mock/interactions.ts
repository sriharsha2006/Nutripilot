export type InteractionEvent =
  | "view"
  | "favorite"
  | "dislike"
  | "refresh"
  | "swap"
  | "serving_change"
  | "eaten";

export interface InteractionRecord {
  id: string;
  itemId: string;
  eventType: InteractionEvent;
  value?: number;
  timestamp: string;
}

let interactions: InteractionRecord[] = [];

export function recordInteraction(itemId: string, eventType: InteractionEvent, value?: number) {
  interactions.push({
    id: `int-${Date.now()}-${interactions.length}`,
    itemId,
    eventType,
    value,
    timestamp: new Date().toISOString(),
  });
}

export function getInteractions() {
  return interactions;
}

export function historicalPreferenceScore(recipeId: string): number {
  const relevant = interactions.filter((i) => i.itemId === recipeId);
  if (!relevant.length) return 0.5;
  let score = 0.5;
  for (const event of relevant) {
    if (event.eventType === "eaten" || event.eventType === "favorite") score += 0.08;
    if (event.eventType === "swap" || event.eventType === "dislike" || event.eventType === "refresh") score -= 0.05;
  }
  return Math.min(1, Math.max(0, score));
}

export function resetInteractions() {
  interactions = [];
}
