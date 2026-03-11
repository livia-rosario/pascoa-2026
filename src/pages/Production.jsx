import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const FILTERS = ["Todos", "Pendente", "Pago", "Pronto", "Entregue"];

export default function Production() {
  const orders = useQuery(api.orders.list) ?? [];
  const [filter, setFilter] = useState("Todos");

  const filtered = filter === "Todos" ? orders : orders.filter(o => o.status === filter);

  // Aggregate by product
  const map = {};
  filtered.forEach(order => {
    order.lines.forEach(line => {
      const k = line.productName;
      if (!map[k]) map[k] = { total: 0, byFilling: {}, price: line.price };
      map[k].total += line.qty;
      const fkey = line.filling || "__none__";
      if (!map[k].byFilling[fkey]) map[k].byFilling[fkey] = { qty: 0, clients: [] };
      map[k].byFilling[fkey].qty += line.qty;
      map[k].byFilling[fkey].clients.push(order.client);
    });
  });

  const totalUnits = Object.values(map).reduce((s, d) => s + d.total, 0);

  return (
    <div>
      {/* Filter chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 800,
            border: "2px solid var(--border)", cursor: "pointer", transition: "all .15s",
            background: filter === f ? "var(--caramel)" : "var(--white)",
            color: filter === f ? "#fff" : "var(--muted)",
            borderColor: filter === f ? "var(--caramel)" : "var(--border)",
          }}>{f}</button>
        ))}
      </div>

      {!filtered.length
        ? <div style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontWeight: 700 }}>Nenhum pedido encontrado</div>
        : <>
          {/* Summary */}
          <div style={{ background: "var(--white)", borderRadius: "var(--radius)", padding: 16, marginBottom: 12, border: "1.5px solid var(--border)", boxShadow: "var(--shadow)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: .8 }}>Total a produzir</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--caramel)", lineHeight: 1.1 }}>
                {totalUnits} <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 700 }}>peças</span>
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: 12, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: .6 }}>
              {filtered.length} pedido{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Per product */}
          {Object.entries(map).map(([name, data]) => {
            const rows = Object.entries(data.byFilling);
            const hasFillings = !(rows.length === 1 && rows[0][0] === "__none__");

            return (
              <div key={name} style={{ background: "var(--white)", borderRadius: "var(--radius)", marginBottom: 12, border: "1.5px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
                {/* Header */}
                <div style={{ background: "var(--caramel)", color: "#fff", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 900, fontSize: 15 }}>{name}</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.8rem", fontWeight: 900, lineHeight: 1 }}>{data.total}</div>
                    <div style={{ fontSize: 10, opacity: .8, fontWeight: 700, textTransform: "uppercase" }}>unidades</div>
                  </div>
                </div>

                {/* Rows */}
                {rows.map(([fname, fdata]) => (
                  <div key={fname} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                        {hasFillings ? fname : "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        {fdata.clients.join(" · ")}
                      </div>
                    </div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--caramel)", minWidth: 36, textAlign: "right" }}>
                      {fdata.qty}×
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </>
      }
    </div>
  );
}
