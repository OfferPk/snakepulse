export interface PersonalBestBadge {
  hidden: boolean;
  textContent: string | null;
}

/** Show and announce a run that beats the previous personal best. */
export function setPersonalBestBadge(
  badge: PersonalBestBadge,
  score: number,
  previousBest: number,
): boolean {
  const isNewBest = score > previousBest;
  badge.hidden = !isNewBest;
  badge.textContent = isNewBest ? `New personal best — ${score}` : '';
  return isNewBest;
}
