/**
 * Helper type for a range of numbers.
 */
type Range<From extends number, To extends number> = Exclude<Enumerate<To>, Enumerate<From>> | From;

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

/**
 * Day of the year from 0 to 364.
 */
export type Day = Range<0, 364>;

/**
 * Level from 1 to 4.
 */
export type Level = Range<0, 4>;

/**
 * Represents an entry in the activity calendar.
 */
export interface ActivityCalendarEntry {
  /**
   * Day of the year, represented as a number between 0 and 364.
   * 0 corresponds to January 1st, 364 corresponds to December 31st (in a non-leap year).
   */
  day: Day;

  dayOfWeek: number;

  weekIndex: number;

  /**
   * Activity level, represented as a number between 1 and 4.
   * 1 represents the lowest level, 4 the highest.
   */
  level: Level;

  /**
   * The value of the activity, can be any number.
   */
  value: number;
}
