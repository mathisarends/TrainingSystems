type RGBAColor = `rgba(${number}, ${number}, ${number}, ${number | number})`;

export interface BarChartData {
  label: string;
  data: number[];
  backgroundColor: RGBAColor;
  borderColor: RGBAColor;
  borderWidth: number;
}
