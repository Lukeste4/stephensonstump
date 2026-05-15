import { useState } from "react";
import { useCreateQuote } from "@workspace/api-client-react";

interface Stump {
  id: number;
  diameter: string;
  deep: boolean;
}

interface PriceBreakdown {
  baseServiceFee: number;
  stumpGrindingCost: number;
  discountRate: number;
  discountAmount: number;
  serviceCost: number;
  taxAmount: number;
  subtotal: number;
  finalTotal: number;
}

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  stumps: Stump[];
  stumpCount: number;
  servicePackage: string;
  servicePackageLabel: string;
  estimatedTotal: number;
  priceBreakdown: PriceBreakdown;
}

const SERVICE_LABEL_MAP: Record<string, string> = {
  "0": "Standard – Leave Wood Chips",
  "0.75": "Cleanup – Chip & Debris Removal",
  "1.05": "Full Restoration – Topsoil & Seed Mat",
};

function buildNoteSummary(stumps: Stump[], servicePackage: string, pb: PriceBreakdown, userNotes: string): string {
  const validStumps = stumps.filter(s => parseFloat(s.diameter) > 0);
  const stumpLines = validStumps.map((s, i) =>
    `  Stump ${i + 1}: ${s.diameter}" diameter${s.deep ? " (Extra Depth)" : ""}`
  ).join("\n");

  const discountLine = pb.discountRate > 0
    ? `Multi-stump discount (${Math.round(pb.discountRate * 100)}%): -$${pb.discountAmount.toFixed(2)}\n`
    : "";

  const servicePackageLine = pb.serviceCost > 0
    ? `Service package add-on: +$${pb.serviceCost.toFixed(2)}\n`
    : "";

  const summary =
    `=== QUOTE DETAILS ===\n` +
    `Stumps (${validStumps.length}):\n${stumpLines}\n\n` +
    `Service Package: ${SERVICE_LABEL_MAP[servicePackage] ?? servicePackage}\n\n` +
    `--- Price Breakdown ---\n` +
    `Base service fee: $${pb.baseServiceFee.toFixed(2)}\n` +
    `Stump grinding: $${pb.stumpGrindingCost.toFixed(2)}\n` +
    discountLine +
    servicePackageLine +
    `Subtotal: $${pb.subtotal.toFixed(2)}\n` +
    `Tax (7%): $${pb.taxAmount.toFixed(2)}\n` +
    `TOTAL ESTIMATE: $${pb.finalTotal.toFixed(2)}\n` +
    (userNotes ? `\n--- Customer Notes ---\n${userNotes}` : "");

  return summary;
}

export default function QuoteModal({
  isOpen,
  onClose,
  stumps = [],
  stumpCount,
  servicePackage,
  estimatedTotal,
  priceBreakdown: pb,
}: QuoteModalProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showStumpDetails, setShowStumpDetails] = useState(false);

  const mutation = useCreateQuote();

  const validStumps = stumps.filter(s => parseFloat(s.diameter) > 0);

  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.address.trim()) errs.address = "Address is required";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    mutation.mutate(
      {
        data: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          notes: buildNoteSummary(stumps, servicePackage, pb, form.notes.trim()),
          stumpCount,
          servicePackage: SERVICE_LABEL_MAP[servicePackage] ?? servicePackage,
          estimatedTotal,
        },
      },
      {
        onSuccess: () => setSubmitted(true),
      }
    );
  };

  const handleClose = () => {
    setForm({ name: "", phone: "", email: "", address: "", notes: "" });
    setErrors({});
    setSubmitted(false);
    setShowStumpDetails(false);
    mutation.reset();
    onClose();
  };

  if (!isOpen) return null;

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: hasError ? "2px solid #dc2626" : "1px solid #ccc",
    outline: hasError ? "3px solid #fca5a5" : "none",
    fontSize: "0.95rem",
    background: "white",
    boxSizing: "border-box",
    transition: "border 0.15s, outline 0.15s",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 6,
    fontWeight: 600,
    fontSize: "0.85rem",
    color: "#333",
  };

  const errorStyle: React.CSSProperties = {
    color: "#dc2626",
    fontSize: "0.78rem",
    marginTop: 4,
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    fontSize: "0.88rem",
  };

  const PriceBreakdownTable = () => (
    <div style={{
      background: "#f5f5f3", borderRadius: 14,
      padding: "16px 18px", marginBottom: 20,
    }}>
      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#888", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Price Breakdown
      </div>

      {/* Stump list toggle */}
      <div style={{ marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => setShowStumpDetails(v => !v)}
          style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: "0.88rem", color: "#555" }}>
              {stumpCount} stump{stumpCount !== 1 ? "s" : ""}
              {validStumps.some(s => s.deep) && (
                <span style={{ color: "#2d5e2b", fontSize: "0.78rem", marginLeft: 6 }}>
                  · {validStumps.filter(s => s.deep).length} extra deep
                </span>
              )}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>${pb.stumpGrindingCost.toFixed(2)}</span>
            <span style={{ color: "#999", fontSize: "0.75rem" }}>{showStumpDetails ? "▲" : "▼"}</span>
          </div>
        </button>

        {showStumpDetails && (
          <div style={{
            marginTop: 8, paddingLeft: 8, borderLeft: "2px solid #e0e0e0",
          }}>
            {validStumps.map((s, i) => (
              <div key={s.id} style={{ ...rowStyle, color: "#555", paddingTop: 3, paddingBottom: 3 }}>
                <span>Stump {i + 1} — {s.diameter}" dia.{s.deep ? " + extra depth" : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ ...rowStyle, color: "#555" }}>
        <span>Base service fee</span>
        <span>${pb.baseServiceFee.toFixed(2)}</span>
      </div>

      {pb.discountRate > 0 && (
        <div style={{ ...rowStyle, color: "#2d5e2b" }}>
          <span>Multi-stump discount ({Math.round(pb.discountRate * 100)}%)</span>
          <span>−${pb.discountAmount.toFixed(2)}</span>
        </div>
      )}

      {pb.serviceCost > 0 && (
        <div style={{ ...rowStyle, color: "#555" }}>
          <span>{SERVICE_LABEL_MAP[servicePackage] ? "Service package add-on" : "Service package"}</span>
          <span>+${pb.serviceCost.toFixed(2)}</span>
        </div>
      )}

      <div style={{ borderTop: "1px solid #ddd", margin: "8px 0" }} />

      <div style={{ ...rowStyle, color: "#555" }}>
        <span>Subtotal</span>
        <span>${pb.subtotal.toFixed(2)}</span>
      </div>
      <div style={{ ...rowStyle, color: "#555" }}>
        <span>Tax (7%)</span>
        <span>${pb.taxAmount.toFixed(2)}</span>
      </div>

      <div style={{ borderTop: "2px solid #ccc", margin: "8px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Estimated Total</span>
        <span style={{ fontWeight: 700, fontSize: "1.15rem", color: "#2d5e2b" }}>${pb.finalTotal.toFixed(2)}</span>
      </div>

      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #e4e4e4" }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#888", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Service Package
        </div>
        <div style={{ fontSize: "0.85rem", color: "#333", fontWeight: 500 }}>
          {SERVICE_LABEL_MAP[servicePackage] ?? servicePackage}
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{
        background: "white", borderRadius: 28,
        width: "100%", maxWidth: 560,
        maxHeight: "90vh",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        display: "flex", flexDirection: "column",
      }}>
      <div style={{ overflowY: "auto", padding: "32px 36px", flex: 1 }}>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "#e9f7e6", display: "flex",
              alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", fontSize: 28,
            }}>✓</div>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 12 }}>
              Quote Submitted!
            </h3>
            <p style={{ color: "#555", lineHeight: 1.6, marginBottom: 24 }}>
              Thanks, {form.name.split(" ")[0]}! We've received your quote request and will be in touch shortly.
            </p>

            <button
              onClick={handleClose}
              style={{
                border: "none", background: "#111", color: "white",
                padding: "14px 28px", borderRadius: 12, fontWeight: 600,
                cursor: "pointer", fontSize: "1rem",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.5px" }}>Request a Quote</h3>
                <p style={{ color: "#666", marginTop: 6, fontSize: "0.9rem" }}>
                  Review your estimate and fill in your details.
                </p>
              </div>
              <button
                onClick={handleClose}
                style={{
                  border: "none", background: "#f5f5f3", color: "#666",
                  width: 36, height: 36, borderRadius: "50%", cursor: "pointer",
                  fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    placeholder="Jane Smith"
                    onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: undefined })); }}
                    style={inputStyle(!!errors.name)}
                  />
                  {errors.name && <div style={errorStyle}>{errors.name}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    placeholder="(515) 555-0123"
                    onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: undefined })); }}
                    style={inputStyle(!!errors.phone)}
                  />
                  {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  placeholder="jane@example.com"
                  onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: undefined })); }}
                  style={inputStyle(!!errors.email)}
                />
                {errors.email && <div style={errorStyle}>{errors.email}</div>}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Property Address *</label>
                <input
                  type="text"
                  value={form.address}
                  placeholder="123 Main St, Ames, IA"
                  onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setErrors(er => ({ ...er, address: undefined })); }}
                  style={inputStyle(!!errors.address)}
                />
                {errors.address && <div style={errorStyle}>{errors.address}</div>}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Additional Notes (optional)</label>
                <textarea
                  value={form.notes}
                  placeholder="Any additional details about your stumps or property..."
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  style={{
                    ...inputStyle(),
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <PriceBreakdownTable />

              {mutation.isError && (
                <div style={{
                  background: "#fee2e2", border: "1px solid #f87171",
                  borderRadius: 10, padding: "12px 16px", marginBottom: 16,
                  color: "#dc2626", fontSize: "0.9rem",
                }}>
                  Something went wrong. Please try again.
                </div>
              )}

              <button
                type="submit"
                disabled={mutation.isPending}
                style={{
                  width: "100%", border: "none",
                  background: mutation.isPending ? "#555" : "#111",
                  color: "white", padding: "16px 24px",
                  borderRadius: 12, fontWeight: 600,
                  cursor: mutation.isPending ? "not-allowed" : "pointer",
                  fontSize: "1rem", transition: "background 0.2s",
                }}
                onMouseEnter={e => { if (!mutation.isPending) e.currentTarget.style.background = "#2b2b2b"; }}
                onMouseLeave={e => { if (!mutation.isPending) e.currentTarget.style.background = "#111"; }}
              >
                {mutation.isPending ? "Submitting…" : "Submit Quote Request"}
              </button>
            </form>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
