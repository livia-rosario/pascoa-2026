import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { statusTag } from "../App";

function fmtMoney(v) {
  return "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export default function Dashboard({ goTo }) {
  const orders = useQuery(api.orders.list) ?? [];

  const total = orders.reduce((s, o) => s + o.total, 0);
  const paid = orders.filter(o => o.status === "Pago" || o.status === "Entregue").reduce((s, o) => s + o.total, 0);
  const pending = orders.filter(o => o.status === "Pendente").length;
  const recent = orders.slice(0, 5);

  return (
    <div className="fade-up">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <StatCard value={orders.length} label="Pedidos" />
        <StatCard value={fmtMoney(total)} label="Faturamento" color="var(--caramel)" />
        <StatCard value={fmtMoney(paid)} label="Recebido" color="var(--rose)" />
        <StatCard value={pending} label="Pendentes" color="var(--amber)" />
      </div>

      <div className="card">
        <div className="card-title">Últimos Pedidos</div>
        {!recent.length ? (
          <div className="empty-state">Nenhum pedido ainda</div>
        ) : recent.map(o => (
          <div key={o._id} style={{
            padding: 12, background: "#fdf4ef", borderRadius: "var(--radius)",
            marginBottom: 8, border: "1.5px solid var(--border)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{o.client}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, fontWeight: 600 }}>{o.date}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 900, fontSize: 15, color: "var(--caramel)" }}>{fmtMoney(o.total)}</div>
                <span className={`tag ${statusTag(o.status)}`}>{o.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ value, label, color }) {
  const hasColor = !!color;
  return (
    <div style={{
      background: hasColor ? color : "#fff",
      border: `1.5px solid ${hasColor ? color : "var(--border)"}`,
      borderRadius: "var(--radius)", padding: "16px 14px",
      textAlign: "center", boxShadow: "var(--shadow)"
    }}>
      <div style={{
        fontSize: typeof value === "string" ? "1.05rem" : "1.9rem",
        fontWeight: 900, color: hasColor ? "#fff" : "var(--text)", lineHeight: 1
      }}>{value}</div>
      <div style={{
        fontSize: 10, fontWeight: 800,
        color: hasColor ? "rgba(255,255,255,.85)" : "var(--muted)",
        letterSpacing: ".8px", textTransform: "uppercase", marginTop: 4
      }}>{label}</div>
    </div>
  );
}
