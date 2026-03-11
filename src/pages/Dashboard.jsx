import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function fmtMoney(v) {
  return "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function stag(s) {
  if (s === "Entregue") return { background: "#e8f5e9", color: "#2e7d32" };
  if (s === "Pago" || s === "Pronto") return { background: "#fff3e0", color: "#e65100" };
  return { background: "#ffebee", color: "#c62828" };
}

const statStyle = (bg) => ({
  background: bg || "var(--white)", border: "1.5px solid var(--border)",
  borderRadius: "var(--radius)", padding: "16px 14px", textAlign: "center",
  boxShadow: "var(--shadow)",
});

export default function Dashboard() {
  const orders = useQuery(api.orders.list) ?? [];

  const total = orders.reduce((s, o) => s + o.total, 0);
  const paid = orders.filter(o => o.status === "Pago" || o.status === "Entregue").reduce((s, o) => s + o.total, 0);
  const pending = orders.filter(o => o.status === "Pendente").length;
  const recent = orders.slice(0, 5);

  const statVal = (color) => ({ fontSize: "1.8rem", fontWeight: 900, color: color || "var(--text)", lineHeight: 1 });
  const statLabel = (color) => ({ fontSize: 10, fontWeight: 800, color: color || "var(--muted)", letterSpacing: .8, textTransform: "uppercase", marginTop: 4 });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div style={statStyle()}>
          <div style={statVal()}>{orders.length}</div>
          <div style={statLabel()}>Pedidos</div>
        </div>
        <div style={{ ...statStyle("var(--caramel)"), border: "none" }}>
          <div style={{ ...statVal("#fff"), fontSize: "1.1rem" }}>{fmtMoney(total)}</div>
          <div style={statLabel("rgba(255,255,255,.8)")}>Faturamento</div>
        </div>
        <div style={{ ...statStyle("var(--rose)"), border: "none" }}>
          <div style={{ ...statVal("#fff"), fontSize: "1.1rem" }}>{fmtMoney(paid)}</div>
          <div style={statLabel("rgba(255,255,255,.8)")}>Recebido</div>
        </div>
        <div style={{ ...statStyle("var(--amber)"), border: "none" }}>
          <div style={statVal("#fff")}>{pending}</div>
          <div style={statLabel("rgba(255,255,255,.8)")}>Pendentes</div>
        </div>
      </div>

      <div style={{ background: "var(--white)", borderRadius: "var(--radius)", padding: 16, boxShadow: "var(--shadow)", border: "1.5px solid var(--border)" }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: .8, marginBottom: 14 }}>
          Últimos Pedidos
        </div>
        {!recent.length
          ? <div style={{ textAlign: "center", padding: 32, color: "var(--muted)", fontWeight: 700 }}>Nenhum pedido ainda</div>
          : recent.map(o => (
            <div key={o._id} style={{ padding: 12, background: "#fdf4ef", borderRadius: "var(--radius)", marginBottom: 8, border: "1.5px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{o.client}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, fontWeight: 600 }}>{o.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 900, fontSize: 15, color: "var(--caramel)" }}>{fmtMoney(o.total)}</div>
                  <span style={{ ...stag(o.status), display: "inline-block", padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 800, marginTop: 3 }}>{o.status}</span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
