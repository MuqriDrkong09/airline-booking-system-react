export type TooltipCapture = {
  formatter?: (value: unknown, name?: unknown) => unknown;
  labelFormatter?: (
    label: unknown,
    payload?: Array<{ payload?: unknown }>,
  ) => unknown;
};

export type YAxisCapture = {
  tickFormatter?: (value: number) => string;
  yAxisId?: string | number;
  orientation?: string;
};

export const dashboardChartCaptures = {
  tooltips: [] as TooltipCapture[],
  yAxes: [] as YAxisCapture[],
  reset() {
    this.tooltips.length = 0;
    this.yAxes.length = 0;
  },
};
