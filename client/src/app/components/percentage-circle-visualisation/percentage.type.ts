/**
 * Helper type for a range of numbers.
 * This utility type constructs a union of numbers ranging from `From` to `To`.
 * For example, `Range<0, 3>` would produce `0 | 1 | 2 | 3`.
 */
type Range<From extends number, To extends number> = Exclude<Enumerate<To>, Enumerate<From>> | From;

/**
 * Enumerate type.
 * This utility type constructs a union of numbers from 0 up to, but not including, `N`.
 * For example, `Enumerate<3>` would produce `0 | 1 | 2`.
 */
type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

/**
 * Percentage type.
 * This type restricts its value to a number between 0 and 100 inclusive.
 * It is constructed using the `Range` utility type with a range from 0 to 100.
 */
export type Percentage = Range<0, 100>;
