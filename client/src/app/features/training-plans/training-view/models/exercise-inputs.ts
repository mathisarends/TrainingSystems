/**
 * The `ExerciseInputs` interface groups HTML input and select elements related
 * to an exercise in a workout table row. It is used to manage and manipulate
 * these elements collectively, such as resetting values or updating form data.
 *
 */
export interface ExerciseInputs {
  exerciseSelect: HTMLSelectElement;
  setsInput: HTMLInputElement;
  repsInput: HTMLInputElement;
  weightInput: HTMLInputElement;
  targetRPEInput: HTMLInputElement;
  rpeInput: HTMLInputElement;
  estMaxInput: HTMLInputElement;
  noteInput: HTMLInputElement;
}
