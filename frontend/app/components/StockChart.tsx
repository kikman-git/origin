"use client";

import { useEffect, useRef } from "react";

type Props = {
  ticker?: string;
  signal?: string;
  confidence?: number;
};

export default function StockChart({ ticker = "TSE:3932", signal, confidence }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: ticker,
      interval: "D",
      timezone: "Asia/Tokyo",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(10, 10, 15, 1)",
      gridColor: "rgba(39, 39, 42, 0.3)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      studies: ["MASimple@tv-basicstudies"],
    });

    containerRef.current.appendChild(script);
  }, [ticker]);

  return (
    <div className="mt-4 rounded-xl border border-zinc-700/50 bg-zinc-950/80 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-zinc-200">{ticker}</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Price Chart</span>
        </div>
        {signal && (
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black ${signal === "BUY" ? "text-emerald-400" : signal === "SELL" ? "text-red-400" : "text-yellow-400"}`}>
              {signal}
            </span>
            {confidence != null && (
              <span className="text-[10px] text-zinc-500">{confidence}% conf.</span>
            )}
          </div>
        )}
      </div>
      {/* TradingView Widget */}
      <div className="tradingview-widget-container" ref={containerRef} style={{ height: 400 }}>
        <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  );
}
