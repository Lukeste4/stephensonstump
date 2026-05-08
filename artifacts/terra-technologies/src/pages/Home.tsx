import { useState, useCallback, useEffect } from "react";
import QuoteModal from "@/components/QuoteModal";
import PhoneModal from "@/components/PhoneModal";
import stephensonLogo from "@/assets/stephenson_logo.png";
import stumpGrindLeafMulch from "@/assets/stump_grind_leave_mulch.jpg";
import stumpGrindRemoveMulch from "@/assets/stump_grind_remove_mulch.png";
import fullLawnRestoration from "@/assets/full_lawn_restoration.png";

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
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

      {/* HEADER SPACER — prevents content from hiding under fixed header */}
      <div style={{
        height: isMobile ? 68 : scrolled ? 80 : 170,
        transition: "height 0.3s ease",
        flexShrink: 0,
      }} />

      {/* HEADER */}
      <header style={{
        background: "white",
        borderBottom: (scrolled || isMobile) ? "1px solid #e8e8e8" : "1px solid transparent",
        padding: isMobile ? "0 4%" : "0 7%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: isMobile ? 68 : scrolled ? 80 : 170,
        zIndex: 100,
        transition: "height 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        boxShadow: (scrolled || isMobile) ? "0 2px 16px rgba(0,0,0,0.07)" : "none",
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 10 }}>
          <img
            src={stephensonLogo}
            alt="Stephenson Stump Grinding"
            style={{
              height: isMobile ? 46 : scrolled ? 52 : 110,
              width: isMobile ? 46 : scrolled ? 52 : 110,
              objectFit: "contain",
              transition: "height 0.3s ease, width 0.3s ease",
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{
              fontSize: isMobile ? "0.95rem" : scrolled ? "1.1rem" : "1.96rem",
              fontWeight: 600,
              letterSpacing: "-0.3px",
              lineHeight: 1.2,
              transition: "font-size 0.3s ease",
            }}>Stephenson Stump Grinding</div>
            {!isMobile && (
              <div style={{
                color: "#666",
                fontSize: scrolled ? "0.8rem" : "1.33rem",
                transition: "font-size 0.3s ease",
              }}>Professional Stump Grinding</div>
            )}
          </div>
        </div>
        <button
          onClick={() => setPhoneModalOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#2d5e2b", color: "white",
            padding: isMobile ? "9px 14px" : scrolled ? "10px 18px" : "13px 22px",
            borderRadius: 999, fontWeight: 600, border: "none",
            fontSize: isMobile ? "0.85rem" : scrolled ? "0.9rem" : "1rem",
            transition: "background 0.2s, padding 0.3s ease, font-size 0.3s ease",
            whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#234122")}
          onMouseLeave={e => (e.currentTarget.style.background = "#2d5e2b")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.47 11.47 0 0 0 3.59.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.59a1 1 0 0 1-.25 1.01l-2.2 2.2z"/>
          </svg>
          {isMobile ? "Call Us" : "(515) 460-5650"}
        </button>
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
            Stephenson Stump Grinding provides efficient stump grinding and removal services with transparent pricing and optional cleanup packages. Typical grind depth is 4–6 inches below grade.
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
            Deep grinding is available for replanting or construction purposes and can reach around 15"–18" below grade.
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
              image: stumpGrindLeafMulch,
            },
            {
              title: "Grinding + Cleanup",
              desc: "Includes chip and debris removal for a cleaner finished appearance.",
              image: stumpGrindRemoveMulch,
            },
            {
              title: "Full Lawn Restoration",
              desc: "Includes debris cleanup, top soil replacement, and grass seed mat installation.",
              image: fullLawnRestoration,
            },
          ].map(({ title, desc, image }) => (
            <div key={title} style={{
              background: "white", border: "1px solid #e8e8e8",
              borderRadius: 24, overflow: "hidden",
            }}>
              {image && (
                <img
                  src={image}
                  alt={title}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              )}
              <div style={{ padding: 30 }}>
                <h4 style={{ marginBottom: 14, fontWeight: 600, fontSize: "1.1rem" }}>{title}</h4>
                <p style={{ color: "#555", lineHeight: 1.6, fontSize: "0.95rem" }}>{desc}</p>
              </div>
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
                    (stumpCount > 0 ? ` (+$${(discountedTotal * 0.75).toFixed(0)})` : "")}
                </option>
                <option value="1.05">
                  {"Removal + Debris Removal + Top Soil & Seed Mat" +
                    (stumpCount > 0 ? ` (+$${(discountedTotal * 1.05).toFixed(0)})` : "")}
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
                    Extra Depth Grinding (15–18") (+20%)
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
              ["Total Stumps", stumpCount > 0 ? stumpCount.toString() : ""],
              ["Base Grinding Cost", stumpCount > 0 ? `$${baseTotal.toFixed(2)}` : ""],
              ["Discount Applied", stumpCount > 0 ? `${(discountRate * 100).toFixed(0)}%` : ""],
              ["Service Package Cost", stumpCount > 0 ? `$${serviceCost.toFixed(2)}` : ""],
              ["Sales Tax (7%)", stumpCount > 0 ? `$${taxAmount.toFixed(2)}` : ""],
              ["Final Estimated Price", stumpCount > 0 ? `$${finalTotal.toFixed(2)}` : ""],
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

      {/* SERVICE AREA */}
      <section style={{ padding: "0 7% 80px" }}>
        <div style={{ marginBottom: 36 }}>
          <h3 style={{ fontSize: "2.5rem", letterSpacing: "-2px", marginBottom: 12, fontWeight: 700 }}>
            Service Area
          </h3>
          <p style={{ color: "#666" }}>Proudly serving Ames and the surrounding Story County communities.</p>
        </div>
        <div style={{
          background: "white", border: "1px solid #e8e8e8",
          borderRadius: 28, padding: "40px 44px",
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {[
              "Ames", "Ankeny", "Boone", "Nevada", "Huxley",
              "Gilbert", "Story City", "Slater", "Cambridge",
              "Kelley", "Madrid", "Ogden", "Ames Township",
            ].map(town => (
              <span key={town} style={{
                background: town === "Ames" ? "#2d5e2b" : "#f0f7ef",
                color: town === "Ames" ? "white" : "#2d5e2b",
                padding: "10px 20px", borderRadius: 999,
                fontWeight: town === "Ames" ? 700 : 500,
                fontSize: "0.95rem",
                border: town === "Ames" ? "none" : "1px solid #c5dfc3",
              }}>
                {town}
              </span>
            ))}
          </div>
          <p style={{ marginTop: 28, color: "#666", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Not sure if we cover your area? Give us a call or text at{" "}
            <button
              onClick={() => setPhoneModalOpen(true)}
              style={{
                background: "none", border: "none", padding: 0,
                color: "#2d5e2b", fontWeight: 600, cursor: "pointer",
                fontSize: "inherit", textDecoration: "underline",
              }}
            >
              (515) 460-5650
            </button>{" "}
            and we'll be happy to help.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: "#111", color: "white",
        textAlign: "center", padding: "60px 20px",
      }}>
        <h3 style={{ fontSize: "1.3rem", fontWeight: 600 }}>Stephenson Stump Grinding</h3>
        <p style={{ marginTop: 10, color: "#bfbfbf" }}>
          Professional stump grinding and property restoration services.
        </p>
        <button
          onClick={() => setPhoneModalOpen(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            marginTop: 20, background: "#2d5e2b", color: "white",
            padding: "12px 24px", borderRadius: 999,
            fontWeight: 600, fontSize: "1rem", border: "none",
            cursor: "pointer", transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#3a7a37")}
          onMouseLeave={e => (e.currentTarget.style.background = "#2d5e2b")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.47 11.47 0 0 0 3.59.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.59a1 1 0 0 1-.25 1.01l-2.2 2.2z"/>
          </svg>
          (515) 460-5650
        </button>
      </footer>

      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        stumpCount={stumpCount}
        servicePackage={servicePackage}
        servicePackageLabel=""
        estimatedTotal={finalTotal}
      />

      <PhoneModal
        isOpen={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
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
