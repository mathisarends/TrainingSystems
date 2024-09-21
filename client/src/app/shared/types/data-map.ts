/**
 * Generic interface for mapping data structures.
 *
 * This interface can be used for various data mappings, including form inputs or API responses.
 *
 * @template T - The expected type of the data. Allows specifying the exact structure of the data being tracked or returned.
 */
export interface DataMap<T = unknown> {
  [key: string]: T; // A map of keys to the generic data type T
}
