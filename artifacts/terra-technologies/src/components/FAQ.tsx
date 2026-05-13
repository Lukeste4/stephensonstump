import { useState, useRef } from "react";

const faqs = [
  {
    category: "About Stump Grinding",
    items: [
      {
        q: "What is stump grinding?",
        a: "Stump grinding is the process of removing a tree stump using a specialized machine that grinds the wood below ground level. The stump is turned into mulch or wood chips, leaving the area ready for grass, landscaping, or replanting. This is not a full stump removal which would involve digging out the entire stump and root system, which is much more invasive and expensive.",
      },
      {
        q: "Why should I remove a tree stump?",
        a: "Tree stumps can attract insects and pests, create tripping hazards, damage lawn equipment, cause unwanted tree sprouts, reduce curb appeal, and interfere with landscaping or construction projects.",
      },
      {
        q: "Will the stump grow back?",
        a: "In most cases, grinding the stump below ground level prevents regrowth. Some species may attempt minor sprouting from remaining roots. These can usually be contained with a few rounds of mowing.",
      },
      {
        q: "Can I plant grass or a new tree where the stump was?",
        a: 'Yes. Most stumps are ground between 4"–6" below grade. The area can usually be filled with topsoil and seeded after grinding. We offer deeper grinding, 12"–18", for replanting or construction projects.',
      },
      {
        q: "Will stump grinding damage my lawn?",
        a: "Professional stump grinders are designed to minimize lawn damage. Most yards experience little to no impact aside from minor tire impressions depending on weather conditions and time of year.",
      },
    ],
  },
  {
    category: "Pricing & Services",
    items: [
      {
        q: "How much does stump grinding cost?",
        a: "Pricing depends on stump diameter, tree species, root spread, accessibility, number of stumps, and ground conditions. Our instant price calculator should give a very close estimate based on the diameter. The final cost will require an on-site quote. Pictures can help the accuracy of estimates as well.",
      },
      {
        q: "How do I measure my stump?",
        a: "Measure from the widest part of the tree where it contacts the ground. Don't fret too much about the perfect measurement for the price calculator — we will come and take our own dimensions for a final cost.",
      },
      {
        q: "Can you grind surface roots too?",
        a: "Yes. Surface roots can usually be ground down upon request. Additional charges may apply depending on the size and number of roots involved.",
      },
      {
        q: "What happens to the debris after grinding?",
        a: "The stump turns into mulch and wood chips during grinding. We have three service levels available: (1) Customers can keep all the mulch for landscaping or compost. (2) We can clean up and remove mulch while leaving some in the remaining stump hole. (3) We can remove mulch, backfill the hole with new topsoil, and lay a grass seed mat down for a total lawn restoration.",
      },
    ],
  },
  {
    category: "Preparation & Logistics",
    items: [
      {
        q: "Can you access stumps in backyards or tight spaces?",
        a: "We typically need 36\" width through fences or landscaping to get access for our equipment. If you have a unique situation, give us a call or text and we will see how we can help you out.",
      },
      {
        q: "How close can you grind near fences, houses, or sidewalks?",
        a: "Modern stump grinders can often work within inches of structures, fences, and hardscapes depending on accessibility and safety conditions.",
      },
      {
        q: "How do I prepare for stump grinding?",
        a: "Clear rocks, decorations, etc. from the area, keep pets and children away from the work zone, and ensure access gates are unlocked.",
      },
      {
        q: "Do I need to mark underground utilities or sprinkler lines?",
        a: "Yes. We require calling 811 to have underground utilities marked to avoid any damages to other services. Please also let us know about irrigation systems, septic systems, invisible dog fences, and any buried private utility lines before grinding begins.",
      },
      {
        q: "Do I need to be home during the service?",
        a: "Usually no. As long as the crew has access to the work area and the scope of work has been approved, the job can often be completed while the homeowner is away.",
      },
    ],
  },
  {
    category: "Scheduling & Payment",
    items: [
      {
        q: "How long does stump grinding take?",
        a: "Most residential stump grinding jobs take between 45 minutes and a few hours depending on stump size and site conditions.",
      },
      {
        q: "How soon can you schedule service?",
        a: "Scheduling depends on season, weather, and workload. Many smaller jobs can be completed within a few days of approval. If you have specific needs or are preparing for an event, please let us know and we will try our hardest to accommodate.",
      },
      {
        q: "What forms of payment do you accept?",
        a: "We accept cash, checks, credit cards, and a few other electronic payments.",
      },
      {
        q: "Are you insured?",
        a: "Yes, we carry liability coverage insurance.",
      },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        borderBottom: "1px solid #e8e8e8",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          padding: "20px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: "0.97rem",
            color: "#111",
            lineHeight: 1.4,
          }}
        >
          {q}
        </span>
        <span
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: open ? "#2d5e2b" : "#f0f0ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.25s ease",
            }}
          >
            <path
              d="M2 4L6 8L10 4"
              stroke={open ? "white" : "#555"}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <div
        ref={contentRef}
        style={{
          maxHeight: open ? contentRef.current?.scrollHeight + "px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <p
          style={{
            color: "#555",
            lineHeight: 1.7,
            fontSize: "0.93rem",
            paddingBottom: 20,
          }}
        >
          {a}
        </p>
      </div>
    </div>
  );
}

export default function FAQ({ onCallClick }: { onCallClick: () => void }) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <section style={{ padding: "0 7% 80px" }}>
      <div style={{ marginBottom: 36 }}>
        <h3
          style={{
            fontSize: "2.5rem",
            letterSpacing: "-2px",
            marginBottom: 12,
            fontWeight: 700,
          }}
        >
          Frequently Asked Questions
        </h3>
        <p style={{ color: "#666" }}>
          Everything you need to know before your service.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: 28,
          alignItems: "start",
        }}
        className="faq-layout"
      >
        {/* Category tabs */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            position: "sticky",
            top: 100,
          }}
          className="faq-tabs"
        >
          {faqs.map((cat, i) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(i)}
              style={{
                background: activeCategory === i ? "#2d5e2b" : "white",
                color: activeCategory === i ? "white" : "#444",
                border: activeCategory === i ? "none" : "1px solid #e8e8e8",
                borderRadius: 12,
                padding: "11px 16px",
                fontWeight: activeCategory === i ? 600 : 500,
                fontSize: "0.88rem",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== i)
                  e.currentTarget.style.background = "#f5f5f3";
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== i)
                  e.currentTarget.style.background = "white";
              }}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* FAQ items */}
        <div
          style={{
            background: "white",
            border: "1px solid #e8e8e8",
            borderRadius: 24,
            padding: "8px 36px 8px",
          }}
        >
          {faqs[activeCategory].items.map((item) => (
            <AccordionItem key={item.q} q={item.q} a={item.a} />
          ))}
          <p
            style={{
              padding: "24px 0",
              color: "#888",
              fontSize: "0.88rem",
              lineHeight: 1.6,
            }}
          >
            Still have questions?{" "}
            <button
              onClick={onCallClick}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "#2d5e2b",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "inherit",
                textDecoration: "underline",
              }}
            >
              Give us a call or text
            </button>{" "}
            and we'll be happy to help.
          </p>
        </div>
      </div>
    </section>
  );
}
