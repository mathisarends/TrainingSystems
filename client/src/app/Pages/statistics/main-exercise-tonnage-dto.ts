import { Tonnage } from './tonnage';

/**
 * Repräsentiert, die Tonnage über Wochen innerhalb einer bestimmten Übungskategorie.
 */
export interface TrainingExerciseTonnageDto {
  squat: Tonnage[];
  bench: Tonnage[];
  deadlift: Tonnage[];
  overheadpress: Tonnage[];
  back: Tonnage[];
  chest: Tonnage[];
  shoulder: Tonnage[];
  biceps: Tonnage[];
  triceps: Tonnage[];
  legs: Tonnage[];
}
