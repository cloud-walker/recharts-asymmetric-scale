import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  getNiceTickValues,
} from "recharts";
import { scaleLinear } from "d3-scale";

const data = [
  { month: "Gen", amount: 120 },
  { month: "Feb", amount: -1400 },
  { month: "Mar", amount: 90 },
  { month: "Apr", amount: -1100 },
  { month: "Mag", amount: 140 },
  { month: "Giu", amount: -1700 },
  { month: "Lug", amount: 70 },
  { month: "Ago", amount: -1300 },
  { month: "Set", amount: 100 },
  { month: "Ott", amount: -1600 },
  { month: "Nov", amount: 85 },
  { month: "Dic", amount: -1200 },
];

function formatEur(value: number) {
  return Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

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

function createAsymmetricScale(
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

const negativeMin = Math.min(0, ...data.map((item) => item.amount));
const positiveMax = Math.max(0, ...data.map((item) => item.amount));
console.log("niceTicks", getNiceTickValues([-1700, 140], 6, true));

const asymmetricScale = createAsymmetricScale(negativeMin, positiveMax, 0.2);

export function Example() {
  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontFamily: "sans-serif", marginBottom: 24 }}>
        Spese mensili
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis
            // domain={["dataMin", "dataMax"]}
            tickFormatter={formatEur}
            ticks={[-1800, 0, 450]}
            scale={asymmetricScale}
          />
          <Tooltip
            formatter={(value) => {
              if (typeof value !== "number") {
                throw new Error("Unexpected value type");
              }
              return formatEur(value);
            }}
          />
          <ReferenceLine y={0} stroke="#666" strokeWidth={2} />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.amount >= 0 ? "#4ade80" : "#f87171"}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
