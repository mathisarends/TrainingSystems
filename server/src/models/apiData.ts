/**
 * Represents a flexible data structure for API responses.
 *
 * Allows any string key with a value of type string, number, or boolean.
 */
export interface ApiData {
  [key: string]: string | number | boolean;
}
