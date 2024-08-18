/**
 * Hilfstyp für eine Range von Zahlen.
 */
type Range<From extends number, To extends number> = Exclude<Enumerate<To>, Enumerate<From>> | From;

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

/**
 * Tag des Jahres von 0 bis 364.
 */
export type Day = Range<0, 364>;

/**
 * Level von 1 bis 4.
 */
export type Level = Range<0, 4>;

/**
 * Repräsentiert einen Eintrag im Aktivitätskalender.
 */
export interface ActivityCalendarEntry {
  /**
   * Tag des Jahres, repräsentiert als Zahl zwischen 0 und 364.
   * 0 entspricht dem 1. Januar, 364 entspricht dem 31. Dezember (in einem nicht-Schaltjahr).
   */
  day: Day;

  /**
   * Aktivitätslevel, repräsentiert als Zahl zwischen 1 und 4.
   * 1 entspricht dem niedrigsten Level, 4 dem höchsten.
   */
  level: Level;

  /**
   * Der Wert der Aktivität, kann jede Zahl sein.
   */
  value: number;
}
