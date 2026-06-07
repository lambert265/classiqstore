export interface TopProduct {
  name: string;
  swatch: string;
  swatchColor: string;
  unitsSold: number;
  price: number;
  stockPct: number;
}

function StockBar({ pct }: { pct: number }) {
  const color = pct > 50 ? "bg-emerald-400" : pct >= 20 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="h-[3px] w-full rounded-full bg-white/8 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

export default function TopProducts({ products }: { products: TopProduct[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[9px] tracking-[0.25em] uppercase text-white/20 font-body">Top Products</p>
        <span className="text-[9px] tracking-[0.15em] uppercase text-[#6b9e7e] font-body">This Week</span>
      </div>

      {!products.length ? (
        <p className="text-xs text-white/20 font-body">No products yet</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {products.map((p) => (
            <li key={p.name} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm"
                style={{ background: p.swatchColor }}>
                {p.swatch}
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="font-body text-[11px] text-white/70 truncate leading-none">{p.name}</p>
                  <p className="font-body text-[10px] text-white/30 shrink-0 leading-none">₦{p.price.toLocaleString()}</p>
                </div>
                <StockBar pct={p.stockPct} />
                <p className="font-body text-[9px] text-white/25 leading-none">{p.unitsSold} sold</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
