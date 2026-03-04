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
import { scaleLinear } from "d3-scale";
import {
  dataBalancedPositiveNegative,
  dataHugeNegativeSmallPositive,
  dataHugePositiveSmallNegative,
  dataNoNegative,
  type DataPoint,
} from "./data";
import { useMemo } from "react";

function formatEur(value: number) {
  return Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatQty(value: number) {
  return Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

const chartCases: Array<{ title: string; data: DataPoint[] }> = [
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

function getAxisTicks(domain: [number, number], tickCount = 6): number[] {
  const [min, max] = domain;

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [0];
  }

  if (min === max) {
    return [min];
  }

  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  const baseTicks = scaleLinear()
    .domain([safeMin, safeMax])
    .nice(tickCount)
    .ticks(tickCount);
  const ticks = new Set<number>(
    baseTicks.filter((tick) => tick >= safeMin && tick <= safeMax),
  );

  ticks.add(safeMin);
  ticks.add(safeMax);

  if (safeMin <= 0 && safeMax >= 0) {
    ticks.add(0);
  }

  return [...ticks].sort((a, b) => a - b);
}

function getAxisTicksNative(domain: [number, number], tickCount = 6): number[] {
  const [min, max] = domain;

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [0];
  }

  if (min === max) {
    return [min];
  }

  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  const span = safeMax - safeMin;
  const targetTickCount = Math.max(2, tickCount);
  const roughStep = span / (targetTickCount - 1);
  const stepPower = 10 ** Math.floor(Math.log10(roughStep));
  const stepError = roughStep / stepPower;

  let stepFactor = 1;
  if (stepError >= 7.5) {
    stepFactor = 10;
  } else if (stepError >= 3.5) {
    stepFactor = 5;
  } else if (stepError >= 1.5) {
    stepFactor = 2;
  }

  const step = stepFactor * stepPower;
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 2);
  const roundTick = (value: number) => Number(value.toFixed(decimals));
  const firstTick = Math.ceil(safeMin / step) * step;
  const lastTick = Math.floor(safeMax / step) * step;
  const ticks = new Set<number>();

  for (let tick = firstTick; tick <= lastTick + step / 2; tick += step) {
    ticks.add(roundTick(tick));
  }

  ticks.add(safeMin);
  ticks.add(safeMax);

  if (safeMin <= 0 && safeMax >= 0) {
    ticks.add(0);
  }

  return [...ticks].sort((a, b) => a - b);
}

function getAmountDomain(data: DataPoint[]): [number, number] {
  const minAmount = Math.min(...data.map((entry) => entry.amount));
  const maxAmount = Math.max(...data.map((entry) => entry.amount));

  if (minAmount >= 0) {
    if (maxAmount === 0) {
      return [0, 1];
    }

    return [0, maxAmount];
  }

  const negativeMagnitude = Math.abs(minAmount);
  const expandedPositiveMax = Math.max(maxAmount, negativeMagnitude * 3);

  if (expandedPositiveMax === minAmount) {
    return [minAmount, minAmount + 1];
  }

  return [minAmount, expandedPositiveMax];
}

function getQuantityDomain(
  data: DataPoint[],
  amountDomain: [number, number],
): [number, number] {
  const [, amountMax] = amountDomain;
  const amountSpan = amountDomain[1] - amountDomain[0];
  const quantityMax = Math.max(...data.map((entry) => entry.quantity), 0);

  if (quantityMax === 0) {
    return [0, 1];
  }

  if (amountMax <= 0 || amountSpan <= 0) {
    return [0, quantityMax];
  }

  const zeroRatio = amountMax / amountSpan;

  if (zeroRatio >= 1) {
    return [0, quantityMax];
  }

  const quantityMin = (quantityMax * (zeroRatio - 1)) / zeroRatio;
  return [quantityMin, quantityMax];
}

function CaseChart({ title, data }: { title: string; data: DataPoint[] }) {
  const { amountDomain, quantityDomain, amountTicks, quantityTicks } =
    useMemo(() => {
      const amountDomain = getAmountDomain(data);
      const quantityDomain = getQuantityDomain(data, amountDomain);
      const tickFunctions = {
        d3: getAxisTicks,
        native: getAxisTicksNative,
      };
      const getTicks = tickFunctions.native;
      const amountTicks = getTicks(amountDomain, 6);
      const quantityTicks = getTicks(quantityDomain, 6);
      return {
        amountDomain,
        quantityDomain,
        amountTicks,
        quantityTicks,
      };
    }, [data]);

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
          margin={{ top: 20, right: 20, left: 20, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis
            yAxisId="amount"
            tickFormatter={formatEur}
            domain={amountDomain}
            ticks={amountTicks}
            width={110}
            tickMargin={8}
          />
          <YAxis
            yAxisId="quantity"
            orientation="right"
            tickFormatter={formatQty}
            allowDecimals={false}
            width={56}
            domain={quantityDomain}
            ticks={quantityTicks}
            tickMargin={8}
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
