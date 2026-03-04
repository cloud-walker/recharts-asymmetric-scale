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
} from "recharts";
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
          <YAxis yAxisId="amount" tickFormatter={formatEur} />
          <YAxis
            yAxisId="quantity"
            orientation="right"
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
