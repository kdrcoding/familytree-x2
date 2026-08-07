import { useEffect, useRef } from 'react';
import { useFamily } from '../context/FamilyContext';
import { useSettings } from '../context/SettingsContext';
import { calculateAge } from '../utils/dates';
import { loadJson, STORAGE_KEYS } from '../utils/storage';
import type { FamilyPerson } from '../types/family';

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Best age match for the name typed at the gate, or null if none / ambiguous. */
export function ageForEnteredName(people: FamilyPerson[], entered: string): number | null {
  const q = normalizeName(entered);
  if (q.length < 2) return null;

  const scored: { person: FamilyPerson; score: number }[] = [];
  for (const person of people) {
    const first = normalizeName(person.firstName);
    const last = normalizeName(person.lastName);
    const full = normalizeName(`${person.firstName} ${person.lastName}`);
    const nick = person.nickname ? normalizeName(person.nickname) : '';
    let score = 0;
    if (full === q || (first && last && `${first} ${last}` === q)) score = 3;
    else if (first === q || (nick && nick === q)) score = 2;
    else if (first && (q.startsWith(first + ' ') || full.startsWith(q))) score = 1;
    if (score > 0) scored.push({ person, score });
  }
  if (scored.length === 0) return null;
  scored.sort((a, b) => b.score - a.score);
  const bestScore = scored[0].score;
  const ties = scored.filter((s) => s.score === bestScore);
  // Ambiguous first-name-only matches: don't guess.
  if (ties.length > 1 && bestScore < 3) return null;
  return calculateAge(ties[0].person.birthDate);
}

/**
 * Defaults Easy Mode off; turns it on when the gate name matches a living
 * relative older than 50. Manual Settings toggles win forever after.
 */
export function EasyModeAgeSync() {
  const { people } = useFamily();
  const { settings, suggestEasyMode } = useSettings();
  const appliedFor = useRef<string | null>(null);

  useEffect(() => {
    if (settings.easyModeManual) return;
    const entered =
      loadJson<string>(STORAGE_KEYS.displayName, (v): v is string => typeof v === 'string')?.trim() ??
      '';
    if (!entered || people.length === 0) return;

    const age = ageForEnteredName(people, entered);
    const key = `${entered}|${age ?? 'na'}`;
    if (appliedFor.current === key) return;
    appliedFor.current = key;

    if (age !== null && age > 50) {
      suggestEasyMode(true);
    }
  }, [people, settings.easyModeManual, suggestEasyMode]);

  return null;
}
