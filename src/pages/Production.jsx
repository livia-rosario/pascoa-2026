import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const FILTERS = ["Todos", "Pendente", "Pago", "Pronto", "Entregue"];

function fmtDate(d) {
  if (!d) return null;
  const [year, month, day] = d.split("-");
  const weekdays = ["dom","seg","ter","qua","qui","sex","sáb"];
  const date = new Date(Number(year), Number(month)-1, Number(day));
  return `${weekdays[date.getDay()]} ${day}/${month}`;
}

export default function Production() {
  const orders = useQuery(api.orders.list) ?? [];
  const [filter, setFilter] = useState("Todos");

  const filtered = (filter === "Todos" ? orders : orders.filter(o => o.status === filter))
    .slice()
    .sort((a, b) => {
      if (!a.deliveryDate && !b.deliveryDate) return 0;
      if (!a.deliveryDate) return 1;
      if (!b.deliveryDate) return -1;
      return new Date(a.deliveryDate) - new Date(b.deliveryDate);
    });

  const map = {};
  filtered.forEach(order => {
    order.lines.forEach(line => {
      const k = line.productName;
      if (!map[k]) map[k] = { total: 0, byFilling: {}, price: line.price };
      map[k].total += line.qty;
      const fkey = line.filling || "__none__";
      if (!map[k].byFilling[fkey]) map[k].byFilling[fkey] = { qty: 0, clients: [] };
      map[k].byFilling[fkey].qty += line.qty;
      map[k].byFilling[fkey].clients.push({ name: order.client, deliveryDate: order.deliveryDate, qty: line.qty });
    });
  });

  const totalUnits = Object.values(map).reduce((s, d) => s + d.total, 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 800,
            border: "2px solid var(--border)", cursor: "pointer",
            background: filter === f ? "var(--caramel)" : "var(--white)",
            color: filter === f ? "#fff" : "var(--muted)",
            borderColor: filter === f ? "var(--caramel)" : "var(--border)",
          }}>{f}</button>
        ))}
      </div>

      {!filtered.length
        ? <div style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontWeight: 700 }}>Nenhum pedido encontrado</div>
        : <>
          <div style={{ background: "var(--white)", borderRadius: "var(--radius)", padding: 16, marginBottom: 12, border: "1.5px solid var(--border)", boxShadow: "var(--shadow)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: .8 }}>Total a produzir</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--caramel)", lineHeight: 1.1 }}>
                {totalUnits} <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 700 }}>peças</span>
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
              {filtered.length} pedido{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {Object.entries(map).map(([name, data]) => {
            const rows = Object.entries(data.byFilling);
            const hasFillings = !(rows.length === 1 && rows[0][0] === "__none__");
            return (
              <div key={name} style={{ background: "var(--white)", borderRadius: "var(--radius)", marginBottom: 12, border: "1.5px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
                <div style={{ background: "var(--caramel)", color: "#fff", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 900, fontSize: 15 }}>{name}</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.8rem", fontWeight: 900, lineHeight: 1 }}>{data.total}</div>
                    <div style={{ fontSize: 10, opacity: .8, fontWeight: 700, textTransform: "uppercase" }}>unidades</div>
                  </div>
                </div>
                {rows.map(([fname, fdata]) => (
                  <div key={fname} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{hasFillings ? fname : "—"}</div>
                      <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--caramel)", minWidth: 36, textAlign: "right" }}>{fdata.qty}×</div>
                    </div>
                    <div style={{ marginTop: 5, display: "flex", flexDirection: "column", gap: 4 }}>
                      {fdata.clients.map((c, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                          <span style={{ color: "var(--muted)" }}>{c.name} ({c.qty}×)</span>
                          {c.deliveryDate && (
                            <span style={{ background: "var(--amber)", color: "#fff", padding: "1px 8px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
                              {fmtDate(c.deliveryDate)}
                            </span>
                          )}
                        </div>
                      ))}
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
