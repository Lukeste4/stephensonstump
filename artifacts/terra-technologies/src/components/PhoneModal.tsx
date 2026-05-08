import { useEffect } from "react";

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PHONE_NUMBER = "5153295923";
const DISPLAY_NUMBER = "(515) 329-5923";

export default function PhoneModal({ isOpen, onClose }: PhoneModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "white", borderRadius: 24, padding: "36px 32px",
          maxWidth: 340, width: "100%",
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
          textAlign: "center",
        }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "#e9f7e6", display: "flex",
          alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#2d5e2b">
            <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.47 11.47 0 0 0 3.59.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.59a1 1 0 0 1-.25 1.01l-2.2 2.2z"/>
          </svg>
        </div>

        <h3 style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: 4 }}>
          Contact Us
        </h3>
        <p style={{ color: "#666", fontSize: "0.95rem", marginBottom: 28 }}>
          {DISPLAY_NUMBER}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <a
            href={`tel:${PHONE_NUMBER}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, background: "#2d5e2b", color: "white",
              padding: "14px 20px", borderRadius: 14, fontWeight: 600,
              textDecoration: "none", fontSize: "1rem",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#234122")}
            onMouseLeave={e => (e.currentTarget.style.background = "#2d5e2b")}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.47 11.47 0 0 0 3.59.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.59a1 1 0 0 1-.25 1.01l-2.2 2.2z"/>
            </svg>
            Call
          </a>

          <a
            href={`sms:${PHONE_NUMBER}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, background: "#f0f7ef", color: "#2d5e2b",
              padding: "14px 20px", borderRadius: 14, fontWeight: 600,
              textDecoration: "none", fontSize: "1rem",
              border: "1px solid #c5dfc3",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#dff0dc")}
            onMouseLeave={e => (e.currentTarget.style.background = "#f0f7ef")}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
            </svg>
            Text
          </a>

          <button
            onClick={onClose}
            style={{
              border: "none", background: "transparent", color: "#999",
              padding: "10px", cursor: "pointer", fontSize: "0.9rem",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#444")}
            onMouseLeave={e => (e.currentTarget.style.color = "#999")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
