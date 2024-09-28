/**
 * Represents an individual option within the select component.
 * Each option consists of an `id` for unique identification and a `label`
 * that will be displayed to the user as the option's name.
 */
export interface SelectOptionItem {
  /**
   * A unique identifier for the option.
   */
  id: string;

  /**
   * The text label that is displayed to the user in the dropdown.
   */
  label: string;
}
