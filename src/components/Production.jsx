import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { statusTag } from "../App";

export default function Production() {
  const orders = useQuery(api.orders.list) ?? [];
  const [filter, setFilter] = useState("all");

  const filters = ["all", "Pendente", "Pago", "Pronto", "Entregue"];
  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  // Aggregate by product → filling
  const map = {};
  filtered.forEach(order => {
    order.lines.forEach(line => {
      const k = line.productName;
      if (!map[k]) map[k] = { total: 0, rows: {}, price: line.price };
      const rkey = line.filling || "__none__";
      if (!map[k].rows[rkey]) map[k].rows[rkey] = { qty: 0, clients: [] };
      map[k].rows[rkey].qty += line.qty;
      map[k].rows[rkey].clients.push(order.client);
      map[k].total += line.qty;
    });
  });

  const totalAll = Object.values(map).reduce((s, d) => s + d.total, 0);

  return (
    <div className="fade-up">
      {/* Filter chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 800,
            border: "2px solid", cursor: "pointer", transition: "all .15s",
            borderColor: filter === f ? "var(--caramel)" : "var(--border)",
            background: filter === f ? "var(--caramel)" : "#fff",
            color: filter === f ? "#fff" : "var(--muted)"
          }}>
            {f === "all" ? "Todos" : f}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <div className="empty-state">Nenhum pedido encontrado</div>
      ) : (
        <>
          {/* Summary */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="card-title" style={{ marginBottom: 2 }}>Total a produzir</div>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--caramel)" }}>
                  {totalAll} <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 700 }}>peças</span>
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".6px" }}>
                {filtered.length} pedidos
              </div>
            </div>
          </div>

          {/* Per product */}
          {Object.entries(map).map(([name, data]) => {
            const rows = Object.entries(data.rows);
            const hasFillings = !(rows.length === 1 && rows[0][0] === "__none__");
            return (
              <div key={name} style={{
                background: "#fff", borderRadius: "var(--radius)",
                boxShadow: "var(--shadow)", marginBottom: 12,
                border: "1.5px solid var(--border)", overflow: "hidden"
              }}>
                {/* Header */}
                <div style={{
                  background: "var(--caramel)", color: "#fff",
                  padding: "12px 16px", display: "flex",
                  justifyContent: "space-between", alignItems: "center"
                }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 15 }}>{name}</div>
                    {hasFillings && <div style={{ fontSize: 11, opacity: .8, marginTop: 2 }}>Por recheio abaixo</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.8rem", fontWeight: 900, lineHeight: 1 }}>{data.total}</div>
                    <div style={{ fontSize: 10, opacity: .8, textTransform: "uppercase", letterSpacing: .5 }}>unidades</div>
                  </div>
                </div>

                {/* Rows */}
                {rows.map(([fname, fdata]) => (
                  <div key={fname} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    padding: "10px 16px", borderBottom: "1px solid var(--border)", fontSize: 14
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text)" }}>
                        {hasFillings ? fname : "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        {fdata.clients.join(" · ")}
                      </div>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: "1.2rem", color: "var(--caramel)", minWidth: 36, textAlign: "right" }}>
                      {fdata.qty}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
