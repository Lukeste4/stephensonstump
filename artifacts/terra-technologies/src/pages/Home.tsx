import { useState, useCallback } from "react";
import QuoteModal from "@/components/QuoteModal";

const PRICE_PER_SQ_IN = 0.37;
const BASE_SERVICE_FEE = 100;
const SALES_TAX = 0.07;

interface Stump {
  id: number;
  diameter: string;
  deep: boolean;
}

function calculateStumpCost(stump: Stump): number {
  const diameter = parseFloat(stump.diameter) || 0;
  const radius = diameter / 2;
  const area = Math.PI * radius * radius;
  let stumpPrice = area * PRICE_PER_SQ_IN;
  if (stump.deep) stumpPrice *= 1.2;
  return stumpPrice;
}

export default function Home() {
  const [stumps, setStumps] = useState<Stump[]>([
    { id: 1, diameter: "", deep: false },
  ]);
  const [nextId, setNextId] = useState(2);
  const [servicePackage, setServicePackage] = useState("0");
  const [invalidIds, setInvalidIds] = useState<Set<number>>(new Set());
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const addStump = () => {
    const emptyIds = stumps
      .filter((s) => !s.diameter || isNaN(parseFloat(s.diameter)))
      .map((s) => s.id);
    if (emptyIds.length > 0) {
      setInvalidIds(new Set(emptyIds));
      return;
    }
    setStumps((prev) => [...prev, { id: nextId, diameter: "", deep: false }]);
    setNextId((n) => n + 1);
  };

  const removeStump = (id: number) => {
    setStumps((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStump = useCallback(
    (id: number, field: keyof Stump, value: string | boolean) => {
      setStumps((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      );
      if (field === "diameter" && typeof value === "string" && parseFloat(value) > 0) {
        setInvalidIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    []
  );

  const stumpCount = stumps.filter((s) => parseFloat(s.diameter) > 0).length;
  const stumpAreaTotal = stumps.reduce((acc, s) => acc + calculateStumpCost(s), 0);

  const baseTotal = BASE_SERVICE_FEE + stumpAreaTotal;
  const discountRate = stumpCount >= 7 ? 0.15 : stumpCount >= 3 ? 0.1 : 0;
  const discountAmount = stumpAreaTotal * discountRate;
  const discountedTotal = baseTotal - discountAmount;
  const serviceMultiplier = parseFloat(servicePackage);
  const serviceCost = discountedTotal * serviceMultiplier;
  const subtotal = discountedTotal + serviceCost;
  const taxAmount = subtotal * SALES_TAX;
  const finalTotal = subtotal + taxAmount;

  const scrollToCalculator = () => {
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f5f5f3", color: "#111", minHeight: "100vh" }}>

      {/* HEADER */}
      <header style={{
        background: "white",
        borderBottom: "1px solid #e8e8e8",
        padding: "20px 7%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg,#234122,#7cc76f)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 22, fontWeight: 700,
          }}>T</div>
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: 600, letterSpacing: "-0.5px" }}>Terra Technologies</div>
            <div style={{ color: "#666", fontSize: "0.85rem" }}>Professional Stump Grinding</div>
          </div>
        </div>
        <div style={{ color: "#555", fontWeight: 500 }}>Ames, Iowa</div>
      </header>

      {/* HERO */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        gap: 60,
        alignItems: "center",
        padding: "90px 7%",
        background: "white",
      }} className="hero-section">
        <div>
          <div style={{
            display: "inline-block", padding: "10px 16px",
            background: "#e9f7e6", color: "#2d5e2b",
            borderRadius: 999, marginBottom: 24,
            fontSize: "0.9rem", fontWeight: 600,
          }}>
            Fast • Clean • Professional
          </div>
          <h2 style={{ fontSize: "4rem", lineHeight: 1, letterSpacing: "-3px", marginBottom: 24, fontWeight: 700 }}>
            Modern Stump Grinding Services
          </h2>
          <p style={{ color: "#555", lineHeight: 1.7, maxWidth: 620, fontSize: "1.05rem" }}>
            Terra Technologies provides efficient stump grinding and removal services with transparent pricing and optional cleanup packages. Typical grind depth is 4–6 inches below grade.
          </p>
          <div style={{ marginTop: 34 }}>
            <button
              onClick={scrollToCalculator}
              style={{
                border: "none", background: "#111", color: "white",
                padding: "16px 24px", borderRadius: 14, fontWeight: 600,
                cursor: "pointer", fontSize: "1rem", transition: "background 0.2s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#2b2b2b")}
              onMouseLeave={e => (e.currentTarget.style.background = "#111")}
            >
              Calculate Pricing
            </button>
          </div>
        </div>

        <div style={{ background: "#111", color: "white", padding: 40, borderRadius: 28 }}>
          <h3 style={{ marginBottom: 25, fontSize: "1.5rem", fontWeight: 600 }}>Pricing Overview</h3>
          {[
            ["Base Service Fee", "$100"],
            ["Grinding Rate", "$0.37 / sq in"],
            ["3–6 Stumps", "10% Discount"],
            ["7+ Stumps", "15% Discount"],
            ["Extra Depth Grinding", "+20%"],
          ].map(([label, value], i, arr) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
          <p style={{ marginTop: 24, color: "#cccccc", fontSize: "0.92rem" }}>
            Deep grinding reaches approximately 10–12 inches below grade.
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding: "80px 7% 0" }}>
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ fontSize: "2.5rem", letterSpacing: "-2px", marginBottom: 12, fontWeight: 700 }}>
            Service Packages
          </h3>
          <p style={{ color: "#666" }}>Flexible cleanup and restoration options available.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {[
            {
              title: "Standard Grinding",
              desc: "Includes professional stump grinding with wood chips left on-site for mulch or compost use.",
            },
            {
              title: "Grinding + Cleanup",
              desc: "Includes chip and debris removal for a cleaner finished appearance.",
            },
            {
              title: "Full Lawn Restoration",
              desc: "Includes debris cleanup, top soil replacement, and grass seed mat installation.",
            },
          ].map(({ title, desc }) => (
            <div key={title} style={{
              background: "white", border: "1px solid #e8e8e8",
              borderRadius: 24, padding: 30,
            }}>
              <h4 style={{ marginBottom: 14, fontWeight: 600, fontSize: "1.1rem" }}>{title}</h4>
              <p style={{ color: "#555", lineHeight: 1.6, fontSize: "0.95rem" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CALCULATOR */}
      <section style={{ padding: "80px 7%" }} id="calculator">
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: "2.5rem", letterSpacing: "-2px", marginBottom: 12, fontWeight: 700 }}>
            Instant Price Calculator
          </h3>
          <p style={{ color: "#666" }}>Enter stump diameters below to estimate your project cost.</p>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, alignItems: "start" }} className="calc-layout">

          {/* LEFT: service package (top) + stump entries + add button */}
          <div style={{
            background: "white", padding: 40, borderRadius: 30,
            border: "1px solid #e8e8e8", boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          }}>

            {/* SERVICE PACKAGE — above stump boxes */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: "0.9rem" }}>
                Choose Service Package
              </label>
              <select
                value={servicePackage}
                onChange={e => setServicePackage(e.target.value)}
                style={{
                  width: "100%", padding: 14, borderRadius: 12,
                  border: "1px solid #ccc", fontSize: "1rem", background: "white",
                }}
              >
                <option value="0">Stump Removal (Leave Wood Chips On Property)</option>
                <option value="0.75">
                  {"Stump Removal + Chip & Debris Removal" +
                    (discountedTotal > 0 ? ` (+$${(discountedTotal * 0.75).toFixed(0)})` : "")}
                </option>
                <option value="1.05">
                  {"Removal + Debris Removal + Top Soil & Seed Mat" +
                    (discountedTotal > 0 ? ` (+$${(discountedTotal * 1.05).toFixed(0)})` : "")}
                </option>
              </select>
            </div>

            {/* STUMP ENTRIES */}
            {stumps.map((stump, index) => (
              <div key={stump.id} style={{
                background: "#fafafa", border: "1px solid #ddd",
                borderRadius: 22, padding: 24, marginBottom: 22,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <h4 style={{ fontWeight: 600 }}>Stump #{index + 1}</h4>
                  {stumps.length > 1 && (
                    <button
                      onClick={() => removeStump(stump.id)}
                      style={{
                        border: "1px solid #ddd", background: "white", color: "#666",
                        padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                        fontSize: "0.8rem", fontWeight: 500, transition: "all 0.15s ease",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "#dc2626";
                        e.currentTarget.style.borderColor = "#dc2626";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "white";
                        e.currentTarget.style.borderColor = "#ddd";
                        e.currentTarget.style.color = "#666";
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: "0.9rem" }}>
                    Diameter (inches)
                  </label>
                  <input
                    type="number"
                    value={stump.diameter}
                    placeholder="Example: 24"
                    onChange={e => updateStump(stump.id, "diameter", e.target.value)}
                    style={{
                      width: "100%", padding: 14, borderRadius: 12,
                      border: invalidIds.has(stump.id)
                        ? "2px solid #dc2626"
                        : "1px solid #ccc",
                      outline: invalidIds.has(stump.id)
                        ? "3px solid #fca5a5"
                        : "none",
                      fontSize: "1rem", background: "white",
                      transition: "border 0.15s ease, outline 0.15s ease",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 16 }}>
                  <input
                    type="checkbox"
                    checked={stump.deep}
                    onChange={e => updateStump(stump.id, "deep", e.target.checked)}
                    style={{ transform: "scale(1.2)", cursor: "pointer" }}
                    id={`deep-${stump.id}`}
                  />
                  <label htmlFor={`deep-${stump.id}`} style={{ cursor: "pointer" }}>
                    Extra Depth Grinding (10–12") (+20%)
                  </label>
                </div>
              </div>
            ))}

            <button
              onClick={addStump}
              style={{
                border: "none", background: "#111", color: "white",
                padding: "14px 22px", borderRadius: 14, fontWeight: 600,
                cursor: "pointer", fontSize: "1rem",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#2b2b2b")}
              onMouseLeave={e => (e.currentTarget.style.background = "#111")}
            >
              + Add Another Stump
            </button>
          </div>

          {/* RIGHT: sticky estimated total */}
          <div style={{
            position: "sticky",
            top: 90,
            background: "#111", color: "white",
            borderRadius: 24, padding: 30,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          }}>
            <h4 style={{ marginBottom: 20, fontSize: "1.5rem", fontWeight: 700 }}>Estimated Total</h4>
            {[
              ["Total Stumps", stumpCount.toString()],
              ["Base Grinding Cost", `$${baseTotal.toFixed(2)}`],
              ["Discount Applied", `${(discountRate * 100).toFixed(0)}%`],
              ["Service Package Cost", `$${serviceCost.toFixed(2)}`],
              ["Sales Tax (7%)", `$${taxAmount.toFixed(2)}`],
              ["Final Estimated Price", `$${finalTotal.toFixed(2)}`],
            ].map(([label, value], i, arr) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between",
                padding: "12px 0", gap: 8,
                borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}>
                <span style={{ fontSize: "0.9rem", color: i === arr.length - 1 ? "white" : "#ccc" }}>{label}</span>
                <strong style={{
                  fontSize: i === arr.length - 1 ? "1.15rem" : "0.95rem",
                  color: i === arr.length - 1 ? "#7cc76f" : "white",
                  whiteSpace: "nowrap",
                }}>{value}</strong>
              </div>
            ))}
            <p style={{ marginTop: 20, color: "#888", fontSize: "0.82rem" }}>
              Pricing updates automatically as measurements are entered.
            </p>
            <button
              onClick={() => setQuoteModalOpen(true)}
              disabled={stumpCount === 0}
              style={{
                marginTop: 20, width: "100%", border: "none",
                background: stumpCount === 0 ? "#333" : "#7cc76f",
                color: stumpCount === 0 ? "#666" : "#111",
                padding: "14px 20px", borderRadius: 12, fontWeight: 700,
                cursor: stumpCount === 0 ? "not-allowed" : "pointer",
                fontSize: "1rem", transition: "background 0.2s",
              }}
              onMouseEnter={e => { if (stumpCount > 0) e.currentTarget.style.background = "#6ab562"; }}
              onMouseLeave={e => { if (stumpCount > 0) e.currentTarget.style.background = "#7cc76f"; }}
            >
              Request a Quote
            </button>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: "#111", color: "white",
        textAlign: "center", padding: "60px 20px",
      }}>
        <h3 style={{ fontSize: "1.3rem", fontWeight: 600 }}>Terra Technologies</h3>
        <p style={{ marginTop: 10, color: "#bfbfbf" }}>
          Professional stump grinding and property restoration services.
        </p>
      </footer>

      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        stumpCount={stumpCount}
        servicePackage={servicePackage}
        servicePackageLabel=""
        estimatedTotal={finalTotal}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @media (max-width: 900px) {
          .hero-section {
            grid-template-columns: 1fr !important;
          }
          .hero-section h2 {
            font-size: 2.7rem !important;
            letter-spacing: -1.5px !important;
          }
          .calc-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
