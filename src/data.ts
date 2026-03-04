export type MonthlyAmount = {
  month: string;
  amount: number;
  quantity: number;
};

export const dataNoNegative: MonthlyAmount[] = [
  { month: "Gen", amount: 120, quantity: 12 },
  { month: "Feb", amount: 180, quantity: 16 },
  { month: "Mar", amount: 90, quantity: 9 },
  { month: "Apr", amount: 210, quantity: 19 },
  { month: "Mag", amount: 160, quantity: 14 },
  { month: "Giu", amount: 140, quantity: 11 },
  { month: "Lug", amount: 200, quantity: 18 },
  { month: "Ago", amount: 130, quantity: 10 },
  { month: "Set", amount: 170, quantity: 15 },
  { month: "Ott", amount: 190, quantity: 17 },
  { month: "Nov", amount: 150, quantity: 13 },
  { month: "Dic", amount: 220, quantity: 20 },
];

export const dataHugeNegativeSmallPositive: MonthlyAmount[] = [
  { month: "Gen", amount: 120, quantity: 8 },
  { month: "Feb", amount: -14000, quantity: 22 },
  { month: "Mar", amount: 90, quantity: 7 },
  { month: "Apr", amount: -18000, quantity: 24 },
  { month: "Mag", amount: 140, quantity: 9 },
  { month: "Giu", amount: -22000, quantity: 27 },
  { month: "Lug", amount: 70, quantity: 6 },
  { month: "Ago", amount: -16000, quantity: 21 },
  { month: "Set", amount: 100, quantity: 8 },
  { month: "Ott", amount: -20000, quantity: 25 },
  { month: "Nov", amount: 85, quantity: 7 },
  { month: "Dic", amount: -17000, quantity: 23 },
];

export const dataHugePositiveSmallNegative: MonthlyAmount[] = [
  { month: "Gen", amount: -120, quantity: 8 },
  { month: "Feb", amount: 14000, quantity: 22 },
  { month: "Mar", amount: -90, quantity: 7 },
  { month: "Apr", amount: 18000, quantity: 24 },
  { month: "Mag", amount: -140, quantity: 9 },
  { month: "Giu", amount: 22000, quantity: 27 },
  { month: "Lug", amount: -70, quantity: 6 },
  { month: "Ago", amount: 16000, quantity: 21 },
  { month: "Set", amount: -100, quantity: 8 },
  { month: "Ott", amount: 20000, quantity: 25 },
  { month: "Nov", amount: -85, quantity: 7 },
  { month: "Dic", amount: 17000, quantity: 23 },
];

export const dataBalancedPositiveNegative: MonthlyAmount[] = [
  { month: "Gen", amount: 850, quantity: 14 },
  { month: "Feb", amount: -910, quantity: 15 },
  { month: "Mar", amount: 1020, quantity: 16 },
  { month: "Apr", amount: -980, quantity: 15 },
  { month: "Mag", amount: 930, quantity: 14 },
  { month: "Giu", amount: -870, quantity: 13 },
  { month: "Lug", amount: 1100, quantity: 17 },
  { month: "Ago", amount: -1060, quantity: 16 },
  { month: "Set", amount: 970, quantity: 15 },
  { month: "Ott", amount: -990, quantity: 15 },
  { month: "Nov", amount: 890, quantity: 14 },
  { month: "Dic", amount: -940, quantity: 14 },
];

export const DATA_CASES = {
  noNegative: dataNoNegative,
  hugeNegativeSmallPositive: dataHugeNegativeSmallPositive,
  hugePositiveSmallNegative: dataHugePositiveSmallNegative,
  balancedPositiveNegative: dataBalancedPositiveNegative,
} as const;
