export type AlphaDriver = {
  factor: string;
  impact: number;
};

export type BetaFactor = {
  factor: string;
  severity: number;
};

export type DebateArgument = {
  position: "bull" | "bear";
  round: number;
  text: string;
  strength: number;
};

export type AnalysisData = {
  company: string;
  ticker: string;
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  agents: string[];
  debate: DebateArgument[];
  alpha: {
    expected_return: number;
    probability: number;
    drivers: AlphaDriver[];
  };
  beta: {
    risk_score: number;
    probability: number;
    factors: BetaFactor[];
  };
  priceHistory: { label: string; price: number }[];
  prediction: { label: string; price: number; upper: number; lower: number }[];
  summary: string;
};

export const MOCK_DATA: AnalysisData = {
  company: "Akatsuki Inc.",
  ticker: "TYO: 3932",
  signal: "BUY",
  confidence: 82,
  agents: ["IR Agent", "Company Agent", "News Agent", "Satellite Agent"],
  debate: [
    {
      position: "bull",
      round: 1,
      text: "Revenue growth of 32.1% YoY driven by Dragon Ball Z Dokkan Battle anniversary events and new AI-DX business segment.",
      strength: 0.85,
    },
    {
      position: "bear",
      round: 1,
      text: "Heavy reliance on single IP (Dragon Ball franchise) creates concentration risk. Mobile game market faces secular decline.",
      strength: 0.72,
    },
    {
      position: "bull",
      round: 2,
      text: "Diversification into AI-DX solutions with JPY 600M first-half revenue validates new growth vector. DOE policy of 4% provides downside protection.",
      strength: 0.88,
    },
    {
      position: "bear",
      round: 2,
      text: "AI-DX segment is pre-profit and unproven at scale. Competitive landscape from established SaaS players poses margin risk.",
      strength: 0.65,
    },
  ],
  alpha: {
    expected_return: 65,
    probability: 72,
    drivers: [
      { factor: "AI-DX segment achieving profitability by FY2027", impact: 25 },
      { factor: "Dragon Ball Daima anime boosting game engagement", impact: 18 },
      { factor: "DOE increase to 5% attracting institutional flow", impact: 12 },
      { factor: "Entertainment & Lifestyle segment scaling", impact: 10 },
    ],
  },
  beta: {
    risk_score: 0.38,
    probability: 28,
    factors: [
      { factor: "Single-IP concentration in game revenue", severity: 0.7 },
      { factor: "Mobile gaming market structural decline", severity: 0.55 },
      { factor: "AI-DX execution risk and cash burn", severity: 0.45 },
      { factor: "JPY strengthening impact on overseas revenue", severity: 0.3 },
    ],
  },
  priceHistory: [
    { label: "Sep", price: 1780 },
    { label: "Oct", price: 1850 },
    { label: "Nov", price: 1920 },
    { label: "Dec", price: 2050 },
    { label: "Jan", price: 2180 },
    { label: "Feb", price: 2350 },
    { label: "Mar", price: 2420 },
  ],
  prediction: [
    { label: "Mar", price: 2420, upper: 2420, lower: 2420 },
    { label: "Jun'26", price: 2680, upper: 2900, lower: 2450 },
    { label: "Sep'26", price: 2950, upper: 3300, lower: 2550 },
    { label: "Dec'26", price: 3200, upper: 3700, lower: 2600 },
    { label: "Mar'27", price: 3500, upper: 4200, lower: 2700 },
  ],
  summary:
    "Bull thesis prevails with convergent multi-source evidence supporting revenue diversification and undervaluation relative to AI-adjacent peers.",
};
