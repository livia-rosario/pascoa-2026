import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { statusTag } from "../App";

function fmtMoney(v) {
  return "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export default function Orders() {
  const orders = useQuery(api.orders.list) ?? [];
  const updateStatus = useMutation(api.orders.updateStatus);
  const deleteOrder = useMutation(api.orders.remove);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [note, setNote] = useState(null);

  const filtered = orders.filter(o => {
    const matchSearch = o.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function buildNote(o) {
    const lines = o.lines.map(l =>
      `• ${l.qty}× ${l.productName}${l.filling ? ` → ${l.filling}` : ""} — ${fmtMoney(l.price * l.qty)}`
    ).join("\n");
    return `*Zuca Confeitaria – Páscoa 2026*\n\nOlá, *${o.client}*!\nSegue o resumo do seu pedido:\n\n${lines}\n${"—".repeat(28)}\n*Total: ${fmtMoney(o.total)}*\n\nObrigada pela compra!\n@zucaconfeitaria`;
  }

  async function copyNote() {
    try {
      await navigator.clipboard.writeText(note);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = note; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    }
    alert("Mensagem copiada!");
  }

  return (
    <div className="fade-up">
      {/* Filters */}
      <div className="card" style={{ padding: 11, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          <input
            type="text" placeholder="Buscar cliente..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 130 }}
          />
          <select
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ flex: 1, minWidth: 110 }}
          >
            <option value="">Todos</option>
            {["Pendente", "Pago", "Pronto", "Entregue"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {!filtered.length
        ? <div className="empty-state">Nenhum pedido encontrado</div>
        : filtered.map(o => (
          <div key={o._id} style={{
            padding: 12, background: "#fdf4ef", borderRadius: "var(--radius)",
            marginBottom: 8, border: "1.5px solid var(--border)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>
                  {o.client}{o.phone ? ` · ${o.phone}` : ""}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, fontWeight: 600 }}>{o.date}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 900, fontSize: 15, color: "var(--caramel)" }}>{fmtMoney(o.total)}</div>
                <span className={`tag ${statusTag(o.status)}`}>{o.status}</span>
              </div>
            </div>

            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
              {o.lines.map(l => `${l.qty}× ${l.productName}${l.filling ? ` (${l.filling})` : ""}`).join(" · ")}
            </div>

            {o.obs && (
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{o.obs}</div>
            )}

            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <select
                className="btn-secondary btn-sm"
                style={{ width: "auto", padding: "6px 9px", fontSize: 12 }}
                value={o.status}
                onChange={e => updateStatus({ id: o._id, status: e.target.value })}
              >
                {["Pendente", "Pago", "Pronto", "Entregue"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                className="btn-secondary btn-sm"
                onClick={() => setNote(buildNote(o))}
              >WhatsApp</button>
              <button
                className="btn-danger btn-sm"
                onClick={() => confirm("Remover pedido?") && deleteOrder({ id: o._id })}
              >✕</button>
            </div>
          </div>
        ))
      }

      {/* WhatsApp Modal */}
      {note && (
        <div
          onClick={() => setNote(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
            zIndex: 200, display: "flex", alignItems: "flex-end",
            justifyContent: "center", padding: 16
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: "18px 18px 10px 10px",
              padding: 20, width: "100%", maxWidth: 500, maxHeight: "82vh", overflowY: "auto"
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 10 }}>
              Mensagem WhatsApp
            </div>
            <div style={{
              background: "#f0faf2", border: "1.5px solid #b2dfdb",
              borderRadius: "var(--radius)", padding: 13,
              fontFamily: "monospace", fontSize: 13, color: "#1b5e20",
              whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.7
            }}>{note}</div>
            <button
              onClick={copyNote}
              style={{
                background: "#25d366", color: "#fff", border: "none",
                padding: "12px 18px", borderRadius: "var(--radius)",
                fontSize: 14, fontWeight: 800, cursor: "pointer",
                width: "100%", marginTop: 8
              }}
            >Copiar Mensagem</button>
            <button className="btn-secondary" style={{ width: "100%", marginTop: 8 }} onClick={() => setNote(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
