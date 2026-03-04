import {
  Area,
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
import {
  dataBalancedPositiveNegative,
  dataHugeNegativeSmallPositive,
  dataHugePositiveSmallNegative,
  dataNoNegative,
  type MonthlyAmount,
} from "./data";

function formatEur(value: number) {
  return Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatQty(value: number) {
  return Intl.NumberFormat("it-IT").format(value);
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

const chartCases: Array<{ title: string; data: MonthlyAmount[] }> = [
  { title: "1) Senza valori negativi", data: dataNoNegative },
  {
    title: "2) Negativi enormi, positivi piccoli",
    data: dataHugeNegativeSmallPositive,
  },
  {
    title: "3) Positivi enormi, negativi piccoli",
    data: dataHugePositiveSmallNegative,
  },
  {
    title: "4) Positivi e negativi simili",
    data: dataBalancedPositiveNegative,
  },
];

function CaseChart({ title, data }: { title: string; data: MonthlyAmount[] }) {
  const negativeMin = Math.min(0, ...data.map((item) => item.amount));
  const positiveMax = Math.max(0, ...data.map((item) => item.amount));
  const asymmetricScale = createAsymmetricScale(negativeMin, positiveMax, 0.2);
  const ticks = getNiceTickValues([negativeMin, positiveMax], 6, true);

  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "#fff",
      }}
    >
      <h3 style={{ fontFamily: "sans-serif", margin: "0 0 12px" }}>{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis
            yAxisId="amount"
            tickFormatter={formatEur}
            ticks={ticks}
            scale={asymmetricScale}
          />
          <YAxis
            yAxisId="quantity"
            orientation="right"
            domain={[0, "dataMax"]}
            tickFormatter={formatQty}
            allowDecimals={false}
            width={40}
          />
          <Tooltip
            formatter={(value, name) => {
              if (typeof value !== "number") {
                throw new Error("Unexpected value type");
              }

              if (name === "amount") {
                return [formatEur(value), "Amount"];
              }

              return [formatQty(value), "Quantity"];
            }}
          />
          <ReferenceLine y={0} stroke="#666" strokeWidth={2} />
          <Area
            yAxisId="quantity"
            type="monotone"
            dataKey="quantity"
            stroke="#60a5fa"
            fill="#93c5fd"
            fillOpacity={0.35}
          />
          <Bar yAxisId="amount" dataKey="amount" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`${entry.month}-${index}`}
                fill={entry.amount >= 0 ? "#4ade80" : "#f87171"}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </section>
  );
}

export function Example() {
  return (
    <div style={{ padding: 32, background: "#f8fafc", minHeight: "100vh" }}>
      <h2 style={{ fontFamily: "sans-serif", marginBottom: 24 }}>
        Spese mensili - casi di test
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: 16,
        }}
      >
        {chartCases.map((chartCase) => (
          <CaseChart
            key={chartCase.title}
            title={chartCase.title}
            data={chartCase.data}
          />
        ))}
      </div>
    </div>
  );
}
