/**
 * Interface representing the time statistics for training days.
 */
export interface TimeStats {
  // Der Schlüssel ist der Index des Trainingstags, und der Wert ist ein Array von Zeiten in Minuten.
  [dayIndex: string]: number[];
}
