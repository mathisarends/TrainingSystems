export interface RepScheme {
  defaultSets: number;
  defaultReps: number;
  defaultRPE: number;
}

export interface RepSchemeByCategory {
  [key: string]: RepScheme;
}
