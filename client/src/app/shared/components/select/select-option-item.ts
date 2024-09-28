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

/**
 * Represents the possible types of options that can be used in the select component.
 * It can either be a simple string or an object with an `id` and `label`.
 */
export type SelectOption = string | SelectOptionItem;

/**
 * Type guard to check if an item is of type `SelectOptionItem`.
 */
export function isSelectOptionItem(item: any): item is SelectOptionItem {
  return typeof item === 'object' && 'id' in item && 'label' in item;
}
