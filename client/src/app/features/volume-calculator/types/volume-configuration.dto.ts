import { SelectionLevel } from './selection-level.enum';
import { TrainingExperienceSelectionLevel } from './training-experience-selection-level.enum';

export interface VolumeCalculatorProps {
  gender: 'male' | 'female';
  bodyWeight: number;
  height: number;
  trainingExperience: TrainingExperienceSelectionLevel;
  age: number;
  nutritution: SelectionLevel;
  sleep: SelectionLevel;
  stress: SelectionLevel;
  adjustmentFactor: number;
}
