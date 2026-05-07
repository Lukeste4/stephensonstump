import { useState } from "react";
import { useCreateQuote } from "@workspace/api-client-react";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  stumpCount: number;
  servicePackage: string;
  servicePackageLabel: string;
  estimatedTotal: number;
}

const SERVICE_LABEL_MAP: Record<string, string> = {
  "0": "Stump Removal (Leave Wood Chips On Property)",
  "0.75": "Stump Removal + Chip & Debris Removal",
  "1.05": "Removal + Debris Removal + Top Soil & Seed Mat",
};

export default function QuoteModal({
  isOpen,
  onClose,
  stumpCount,
  servicePackage,
  estimatedTotal,
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

  const mutation = useCreateQuote();

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
          notes: form.notes.trim(),
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
        padding: 40, width: "100%", maxWidth: 560,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "#e9f7e6", display: "flex",
              alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", fontSize: 28,
            }}>✓</div>
            <h3 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 12 }}>
              Quote Submitted!
            </h3>
            <p style={{ color: "#555", lineHeight: 1.6, marginBottom: 28 }}>
              Thanks, {form.name.split(" ")[0]}! We've received your quote request and will be in touch shortly.
            </p>
            <div style={{
              background: "#f5f5f3", borderRadius: 16, padding: 20,
              marginBottom: 28, textAlign: "left",
            }}>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: 8 }}>Quote Summary</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#555" }}>Stumps</span>
                <strong>{stumpCount}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#555" }}>Package</span>
                <strong style={{ textAlign: "right", maxWidth: "60%", fontSize: "0.9rem" }}>
                  {SERVICE_LABEL_MAP[servicePackage] ?? servicePackage}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#555" }}>Estimate</span>
                <strong style={{ color: "#2d5e2b" }}>${estimatedTotal.toFixed(2)}</strong>
              </div>
            </div>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.5px" }}>Request a Quote</h3>
                <p style={{ color: "#666", marginTop: 6, fontSize: "0.9rem" }}>
                  We'll follow up to confirm your appointment.
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

            {/* Quote summary strip */}
            <div style={{
              background: "#111", color: "white", borderRadius: 16,
              padding: "16px 20px", marginBottom: 24,
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
              flexWrap: "wrap",
            }}>
              <div>
                <div style={{ fontSize: "0.78rem", color: "#999", marginBottom: 2 }}>Stumps</div>
                <strong>{stumpCount}</strong>
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: "0.78rem", color: "#999", marginBottom: 2 }}>Package</div>
                <strong style={{ fontSize: "0.85rem" }}>{SERVICE_LABEL_MAP[servicePackage] ?? servicePackage}</strong>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.78rem", color: "#999", marginBottom: 2 }}>Estimate</div>
                <strong style={{ color: "#7cc76f", fontSize: "1.1rem" }}>${estimatedTotal.toFixed(2)}</strong>
              </div>
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

              <div style={{ marginBottom: 24 }}>
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
  );
}
