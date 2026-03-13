import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function fmtMoney(v) {
  return "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d) {
  if (!d) return null;
  const [year, month, day] = d.split("-");
  return `${day}/${month}/${year}`;
}
function stag(s) {
  if (s === "Entregue") return { background: "#e8f5e9", color: "#2e7d32" };
  if (s === "Pago" || s === "Pronto") return { background: "#fff3e0", color: "#e65100" };
  return { background: "#ffebee", color: "#c62828" };
}

export default function Orders() {
  const orders = useQuery(api.orders.list) ?? [];
  const updateStatus = useMutation(api.orders.updateStatus);
  const removeOrder = useMutation(api.orders.remove);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modalNote, setModalNote] = useState(null);

  const filtered = orders
    .filter(o => !search || o.client.toLowerCase().includes(search.toLowerCase()))
    .filter(o => !filterStatus || o.status === filterStatus);

  function showNote(o) {
    const lines = o.lines.map(l => `• ${l.qty}× ${l.productName}${l.filling ? " → " + l.filling : ""} — ${fmtMoney(l.price * l.qty)}`).join("\n");
    setModalNote(`*Zuca Confeitaria – Páscoa 2026*\n\nOlá, *${o.client}*!\nSegue o resumo do seu pedido:\n\n${lines}\n${"—".repeat(28)}\n*Total: ${fmtMoney(o.total)}*\n\nObrigada pela compra!\n@zucaconfeitaria`);
  }

  function copyNote() {
    navigator.clipboard.writeText(modalNote).then(() => alert("Mensagem copiada!")).catch(() => {
      const ta = document.createElement("textarea"); ta.value = modalNote;
      document.body.appendChild(ta); ta.select(); document.execCommand("copy");
      document.body.removeChild(ta); alert("Mensagem copiada!");
    });
  }

  const inp = { padding: "10px 12px", border: "2px solid var(--border)", borderRadius: "var(--radius)", fontSize: 14, color: "var(--text)", background: "#fdf4ef", outline: "none", fontFamily: "inherit" };

  return (
    <div>
      <div style={{ background: "var(--white)", borderRadius: "var(--radius)", padding: 11, marginBottom: 12, border: "1.5px solid var(--border)", display: "flex", gap: 7, flexWrap: "wrap" }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." style={{ ...inp, flex: 1, minWidth: 130 }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inp, flex: 1, minWidth: 110 }}>
          <option value="">Todos</option>
          {["Pendente", "Pago", "Pronto", "Entregue"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {!filtered.length
        ? <div style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontWeight: 700 }}>Nenhum pedido encontrado</div>
        : filtered.map(o => (
          <div key={o._id} style={{ padding: 12, background: "#fdf4ef", borderRadius: "var(--radius)", marginBottom: 9, border: "1.5px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{o.client}{o.phone ? " · " + o.phone : ""}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, fontWeight: 600, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <span>Pedido: {o.date}</span>
                  {o.deliveryDate && <span style={{ background: "var(--amber)", color: "#fff", padding: "1px 8px", borderRadius: 20, fontWeight: 800 }}>Entrega: {fmtDate(o.deliveryDate)}</span>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 900, fontSize: 15, color: "var(--caramel)" }}>{fmtMoney(o.total)}</div>
                <span style={{ ...stag(o.status), display: "inline-block", padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>{o.status}</span>
              </div>
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
              {o.lines.map(l => `${l.qty}× ${l.productName}${l.filling ? " (" + l.filling + ")" : ""}`).join(" · ")}
            </div>
            {o.obs && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{o.obs}</div>}
            <div style={{ display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
              <select value={o.status} onChange={e => updateStatus({ id: o._id, status: e.target.value })} style={{ ...inp, padding: "6px 9px", fontSize: 12 }}>
                {["Pendente", "Pago", "Pronto", "Entregue"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => showNote(o)} style={{ padding: "7px 12px", background: "#fdf4ef", border: "2px solid var(--border)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>WhatsApp</button>
              <button onClick={() => { if (confirm("Remover pedido?")) removeOrder({ id: o._id }); }} style={{ padding: "7px 11px", background: "#fff0ee", border: "2px solid #f5c0b8", color: "#c0392b", borderRadius: "var(--radius)", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>✕</button>
            </div>
          </div>
        ))
      }

      {modalNote && (
        <div onClick={() => setModalNote(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 200, padding: 16, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "18px 18px 10px 10px", padding: 20, width: "100%", maxWidth: 500, maxHeight: "82vh", overflowY: "auto" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>Mensagem WhatsApp</div>
            <div style={{ background: "#f0faf2", border: "1.5px solid #b2dfdb", borderRadius: "var(--radius)", padding: 13, fontFamily: "monospace", fontSize: 13, color: "#1b5e20", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.7 }}>{modalNote}</div>
            <button onClick={copyNote} style={{ background: "#25d366", color: "#fff", border: "none", padding: "12px 18px", borderRadius: "var(--radius)", fontSize: 14, fontWeight: 800, cursor: "pointer", width: "100%", marginTop: 8, fontFamily: "inherit" }}>Copiar Mensagem</button>
            <button onClick={() => setModalNote(null)} style={{ width: "100%", marginTop: 8, padding: 10, background: "#fdf4ef", border: "2px solid var(--border)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
