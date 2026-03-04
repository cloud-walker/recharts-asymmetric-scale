import { scaleLinear } from "d3-scale";

type AxisScale = {
  (value: number): number;
  domain(): number[];
  domain(values: readonly number[]): AxisScale;
  range(): number[];
  range(values: readonly number[]): AxisScale;
  copy(): AxisScale;
  ticks(count?: number): number[];
  tickFormat(count?: number, specifier?: string): (d: number) => string;
};

export function createAsymmetricScale(
  negativeMin: number,
  positiveMax: number,
  negativeShare: number,
): AxisScale {
  let inner = scaleLinear<number>()
    .domain([negativeMin, 0, positiveMax])
    .range([0, negativeShare, 1]);

  const scale = ((value: number) => inner(value)) as AxisScale;

  const domainFn = ((values?: readonly number[]) => {
    if (!values) {
      return inner.domain();
    }

    if (values.length < 2) {
      return scale;
    }

    const first = values[0];
    const last = values[values.length - 1];
    const middle = first <= 0 && last >= 0 ? 0 : (first + last) / 2;
    inner = inner.domain([first, middle, last]);
    return scale;
  }) as AxisScale["domain"];

  const rangeFn = ((values?: readonly number[]) => {
    if (!values) {
      return inner.range();
    }

    if (values.length < 2) {
      return scale;
    }

    const start = values[0];
    const end = values[values.length - 1];
    const middle = start + (end - start) * negativeShare;
    inner = inner.range([start, middle, end]);
    return scale;
  }) as AxisScale["range"];

  scale.domain = domainFn;
  scale.range = rangeFn;

  scale.copy = () =>
    createAsymmetricScale(negativeMin, positiveMax, negativeShare);
  scale.ticks = (count = 10) => inner.ticks(count);
  scale.tickFormat = (count = 10, specifier?: string) =>
    inner.tickFormat(count, specifier);

  return scale;
}
