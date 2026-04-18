import { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { countries, regions } from "./data";

const C = {
  gold: "#D4A853", green: "#2E7D5E", rust: "#C0522A",
  dark: "#0F0F0F", card: "#161616", border: "#252525",
  muted: "#6B6B6B", text: "#E8E3D8", textMuted: "#9A9490", blue: "#5B8DB8",
};

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

function MetricCard({ label, rawValue, display, sub, accent }) {
  const animated = useCountUp(rawValue);
  const suffix = display.replace(/[0-9]/g, "");
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: `2px solid ${accent}`, padding: "1.25rem 1.5rem", borderRadius: "2px" }}>
      <p style={{ fontSize: "11px", letterSpacing: "0.12em", color: C.textMuted, margin: "0 0 0.5rem", textTransform: "uppercase" }}>{label}</p>
      <p style={{ fontSize: "28px", fontFamily: "'Bebas Neue', sans-serif", color: C.text, margin: "0 0 0.25rem", letterSpacing: "0.04em" }}>{animated}{suffix}</p>
      <p style={{ fontSize: "12px", color: C.textMuted, margin: 0 }}>{sub}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1A1A1A", border: `1px solid ${C.border}`, padding: "10px 14px", borderRadius: "2px" }}>
      <p style={{ color: C.textMuted, fontSize: "11px", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: "14px", fontFamily: "'Bebas Neue', sans-serif", margin: "2px 0", letterSpacing: "0.04em" }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

function CountryPanel({ country, onClose }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const growth = ((country.pop2025 - country.pop2015) / country.pop2015 * 100).toFixed(1);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div onClick={e => e.stopPropagation()} style={{ background: "#111", border: `1px solid ${C.border}`, borderTop: `3px solid ${C.gold}`, borderRadius: "2px", padding: "2rem", maxWidth: "460px", width: "100%", animation: "slideUp 0.2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "30px", letterSpacing: "0.08em", color: C.gold, margin: 0 }}>{country.name}</h2>
            <p style={{ fontSize: "12px", color: C.textMuted, margin: "4px 0 0", letterSpacing: "0.08em" }}>{country.region}</p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textMuted, padding: "4px 10px", cursor: "pointer", borderRadius: "2px", fontSize: "18px", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "1.5rem" }}>
          {[
            ["Capitale", country.capital],
            ["Monnaie", country.currency],
            ["Population 2025", `${country.pop2025}M hab.`],
            ["PIB", `$${country.gdp}Md`],
            ["Internet", `${country.internet}%`],
            ["Croissance démo.", `+${growth}% (10 ans)`],
          ].map(([label, value]) => (
            <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, padding: "12px 14px", borderRadius: "2px" }}>
              <p style={{ fontSize: "10px", color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>{label}</p>
              <p style={{ fontSize: "15px", color: C.text, fontWeight: 500, margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>

        <div>
          <p style={{ fontSize: "10px", color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>Pénétration internet</p>
          <div style={{ height: "6px", background: C.border, borderRadius: "3px" }}>
            <div style={{ width: `${country.internet}%`, height: "100%", borderRadius: "3px", background: country.internet > 60 ? C.green : country.internet > 40 ? C.gold : C.rust }} />
          </div>
          <p style={{ fontSize: "12px", color: C.textMuted, margin: "6px 0 0", textAlign: "right" }}>{country.internet}% de la population</p>
        </div>

        <p style={{ fontSize: "11px", color: C.muted, marginTop: "1.25rem", textAlign: "center" }}>Échap ou clic extérieur pour fermer</p>
      </div>
    </div>
  );
}

export default function App() {
  const [region, setRegion] = useState("Toutes les régions");
  const [sortBy, setSortBy] = useState("gdp");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() =>
    region === "Toutes les régions" ? countries : countries.filter(c => c.region === region),
    [region]
  );

  const totalPop = filtered.reduce((s, c) => s + c.pop2025, 0);
  const avgGdp = Math.round(filtered.reduce((s, c) => s + c.gdp, 0) / filtered.length);
  const avgInternet = Math.round(filtered.reduce((s, c) => s + c.internet, 0) / filtered.length);
  const connected = Math.round((avgInternet / 100) * totalPop);

  const topGdp = [...filtered].sort((a, b) => b.gdp - a.gdp).slice(0, 8);
  const popEvolution = filtered.slice(0, 6).map(c => ({ name: c.name, "2015": c.pop2015, "2020": c.pop2020, "2025": c.pop2025 }));
  const internetData = [{ name: "Connectés", value: connected }, { name: "Non connectés", value: totalPop - connected }];
  const sorted = [...filtered].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div style={{ minHeight: "100vh", background: C.dark, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.dark}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; }
        select { appearance: none; cursor: pointer; }
        select option { background: #1A1A1A; }
        .row-hover:hover { background: #1C1C1C !important; cursor: pointer; }
        @media (max-width: 640px) {
          .charts-grid { grid-template-columns: 1fr !important; }
          .metrics-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <header style={{ borderBottom: `1px solid ${C.border}`, padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", position: "sticky", top: 0, background: C.dark, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(22px, 4vw, 34px)", letterSpacing: "0.12em", color: C.gold }}>AFRICA PULSE</h1>
          <span style={{ fontSize: "11px", color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{filtered.length} pays · 2025</span>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {regions.map(r => (
            <button key={r} onClick={() => setRegion(r)} style={{
              padding: "5px 12px", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase",
              background: region === r ? C.gold : "transparent", color: region === r ? C.dark : C.textMuted,
              border: `1px solid ${region === r ? C.gold : C.border}`, borderRadius: "2px", cursor: "pointer",
              transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
            }}>{r === "Toutes les régions" ? "Tout" : r.replace("Afrique ", "")}</button>
          ))}
        </div>
      </header>

      <main style={{ padding: "1.5rem", maxWidth: "1400px", margin: "0 auto" }}>

        <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginBottom: "1.5rem" }}>
          <MetricCard label="Population totale" rawValue={totalPop} display={`${totalPop}M`} sub="habitants en 2025" accent={C.gold} />
          <MetricCard label="PIB moyen" rawValue={avgGdp} display={`${avgGdp}Md`} sub="milliards USD" accent={C.green} />
          <MetricCard label="Internet moyen" rawValue={avgInternet} display={`${avgInternet}%`} sub="pénétration" accent={C.rust} />
          <MetricCard label="Connectés" rawValue={connected} display={`${connected}M`} sub={`sur ${totalPop}M hab.`} accent={C.blue} />
        </div>

        <div className="charts-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: "1.25rem", borderRadius: "2px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: "1rem" }}>PIB — Top {topGdp.length} pays (Md USD)</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topGdp} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: C.textMuted, fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.textMuted, fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="gdp" name="PIB" radius={[2, 2, 0, 0]} isAnimationActive animationDuration={800}>
                  {topGdp.map((_, i) => <Cell key={i} fill={i === 0 ? C.gold : C.border} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: "1.25rem", borderRadius: "2px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: "1rem" }}>Accès internet (millions)</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={internetData} cx="50%" cy="50%" innerRadius={60} outerRadius={88} paddingAngle={3} dataKey="value" isAnimationActive animationDuration={900}>
                  <Cell fill={C.gold} />
                  <Cell fill={C.border} />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: C.textMuted, fontSize: "12px" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: "1.25rem", borderRadius: "2px", marginBottom: "10px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: "1rem" }}>Évolution démographique 2015 → 2025 (millions)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={popEvolution} margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: C.textMuted, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textMuted, fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: C.textMuted, fontSize: "12px" }}>{v}</span>} />
              {["2015", "2020", "2025"].map((y, i) => (
                <Line key={y} type="monotone" dataKey={y} stroke={[C.gold, C.green, C.rust][i]} strokeWidth={2} dot={false} isAnimationActive animationDuration={1000} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ padding: "0.875rem 1.5rem", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase" }}>
              {sorted.length} pays · <span style={{ color: C.gold }}>cliquez sur une ligne pour les détails</span>
            </p>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: C.dark, color: C.textMuted, border: `1px solid ${C.border}`, padding: "5px 12px", fontSize: "10px", letterSpacing: "0.08em", borderRadius: "2px", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>
              <option value="gdp">Trier par PIB</option>
              <option value="pop2025">Trier par Population</option>
              <option value="internet">Trier par Internet</option>
            </select>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Pays", "Région", "Pop. 2025", "PIB (Md$)", "Internet %"].map(h => (
                    <th key={h} style={{ padding: "10px 1.25rem", textAlign: "left", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, i) => (
                  <tr key={c.name} className="row-hover" onClick={() => setSelected(c)}
                    style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.1s", background: "transparent" }}>
                    <td style={{ padding: "11px 1.25rem", color: C.text, fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: "11px 1.25rem", color: C.textMuted, fontSize: "12px" }}>{c.region}</td>
                    <td style={{ padding: "11px 1.25rem", color: C.text }}>{c.pop2025}M</td>
                    <td style={{ padding: "11px 1.25rem", color: i === 0 ? C.gold : C.text }}>${c.gdp}Md</td>
                    <td style={{ padding: "11px 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "3px", background: C.border, borderRadius: "2px", maxWidth: "80px" }}>
                          <div style={{ width: `${c.internet}%`, height: "100%", background: c.internet > 60 ? C.green : c.internet > 40 ? C.gold : C.rust, borderRadius: "2px" }} />
                        </div>
                        <span style={{ color: C.textMuted, minWidth: "32px", fontSize: "12px" }}>{c.internet}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: "11px", color: C.muted, letterSpacing: "0.08em", marginTop: "1.5rem", paddingBottom: "1rem" }}>
          AFRICA PULSE · Gaïus Chanis HONTONWAKOU · Données indicatives 2025
        </p>
      </main>

      {selected && <CountryPanel country={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
