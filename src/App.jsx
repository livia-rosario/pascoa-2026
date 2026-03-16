import React, { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Production from "./pages/Production";
import NewOrder from "./pages/NewOrder";
import Orders from "./pages/Orders";

const TABS = [
  { id: "dashboard", label: "Painel" },
  { id: "production", label: "Produção" },
  { id: "orders", label: "Pedidos" },
];

export default function App() {
  const [auth, setAuth] = useState(() => localStorage.getItem("za") === "1");
  const [tab, setTab] = useState("dashboard");
  const seedProducts = useMutation(api.products.seed);

  useEffect(() => {
    if (auth) seedProducts().catch(() => {});
  }, [auth]);

  if (!auth) return <Login onLogin={() => { localStorage.setItem("za", "1"); setAuth(true); }} />;

  const pages = { dashboard: Dashboard, production: Production, "new-order": NewOrder, orders: Orders };
  const Page = pages[tab];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header style={{
        background: "var(--white)", borderBottom: "2px solid var(--border)",
        padding: "11px 18px", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100,
      }}>
        <img src="/logo.png" alt="Zuca" style={{ height: 30 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            background: "var(--amber)", color: "#fff", fontSize: 11,
            fontWeight: 900, letterSpacing: 1, padding: "3px 10px",
            borderRadius: 20, textTransform: "uppercase",
          }}>Páscoa 2026</span>
          <button onClick={() => { localStorage.removeItem("za"); setAuth(false); }} style={{
            background: "none", border: "2px solid var(--border)", color: "var(--muted)",
            padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800, cursor: "pointer",
          }}>Sair</button>
        </div>
      </header>

      {/* Big New Order Button */}
      <div style={{ background: "var(--white)", borderBottom: "2px solid var(--border)", padding: "10px 14px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <button onClick={() => setTab("new-order")} style={{
            width: "100%", padding: "14px", cursor: "pointer", fontFamily: "inherit",
            background: tab === "new-order" ? "var(--caramel-dark)" : "var(--caramel)",
            color: "#fff", border: "none", borderRadius: "var(--radius)",
            fontSize: 16, fontWeight: 900, letterSpacing: .5,
            boxShadow: "0 4px 16px rgba(208,168,125,0.35)", transition: "background .2s",
          }}>+ Novo Pedido</button>
        </div>
      </div>

      <nav style={{
        background: "var(--white)", display: "flex",
        borderBottom: "2px solid var(--border)", position: "sticky", top: 55, zIndex: 99,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "10px 6px 8px", border: "none", background: "none",
            fontSize: 11, fontWeight: 800, cursor: "pointer", letterSpacing: .3,
            textTransform: "uppercase", transition: "all .2s",
            color: tab === t.id ? "var(--caramel)" : "var(--muted)",
            borderBottom: tab === t.id ? "3px solid var(--caramel)" : "3px solid transparent",
          }}>{t.label}</button>
        ))}
      </nav>

      <main style={{ flex: 1, padding: "18px 14px", maxWidth: 680, margin: "0 auto", width: "100%" }}>
        <Page onNavigate={setTab} />
      </main>
    </div>
  );
}
