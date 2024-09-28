/**
 * Interface representing a checkbox item.
 * It holds the label for the checkbox and its checked state.
 */
export interface CheckboxItem {
  /**
   * An unique identifier for the chekbox item.
   */
  id?: string;

  /**
   * The label for the checkbox.
   */
  label: string;

  /**
   * Boolean value indicating whether the checkbox is checked or not.
   */
  isChecked: boolean;
}
