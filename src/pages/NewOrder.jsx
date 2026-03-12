import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function fmtMoney(v) {
  return "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const inp = { width: "100%", padding: "11px 12px", border: "2px solid var(--border)", borderRadius: "var(--radius)", fontSize: 14, color: "var(--text)", background: "#fdf4ef", outline: "none", fontFamily: "inherit" };
const lbl = { display: "block", fontSize: 11, fontWeight: 800, color: "var(--muted)", marginBottom: 4, letterSpacing: .4, textTransform: "uppercase" };

export default function NewOrder({ onNavigate }) {
  const products = useQuery(api.products.list) ?? [];
  const addOrder = useMutation(api.orders.add);
  const [client, setClient] = useState("");
  const [phone, setPhone] = useState("");
  const [obs, setObs] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [lines, setLines] = useState([{ productId: "", qty: 1, filling: "" }]);

  const updateLine = (i, key, val) => {
    const next = [...lines];
    next[i] = { ...next[i], [key]: val };
    if (key === "productId") next[i].filling = "";
    setLines(next);
  };

  const getProduct = (id) => products.find(p => p._id === id) || products[0];

  const total = lines.reduce((s, l) => {
    const p = getProduct(l.productId);
    return s + (p?.price || 0) * (l.qty || 1);
  }, 0);

  async function save() {
    if (!client.trim()) { alert("Informe o nome do cliente!"); return; }
    if (!products.length) { alert("Nenhum produto disponível."); return; }
    const orderLines = lines.map(l => {
      const p = getProduct(l.productId);
      return { productId: l.productId || p?._id || "", productName: p?.name || "", price: p?.price || 0, qty: l.qty || 1, filling: l.filling || "" };
    });
    await addOrder({
      client: client.trim(), phone: phone.trim(), obs: obs.trim(),
      deliveryDate: deliveryDate || "",
      lines: orderLines,
      total: orderLines.reduce((s, l) => s + l.price * l.qty, 0),
      status: "Pendente",
      date: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    });
    setClient(""); setPhone(""); setObs(""); setDeliveryDate("");
    setLines([{ productId: "", qty: 1, filling: "" }]);
    alert("Pedido salvo!");
    onNavigate("orders");
  }

  if (!products.length) return <div style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontWeight: 700 }}>Carregando...</div>;

  return (
    <div>
      <div style={{ background: "var(--white)", borderRadius: "var(--radius)", padding: 16, marginBottom: 12, border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: .8, marginBottom: 14 }}>Dados do Cliente</div>
        {[
          { label: "Nome", val: client, set: setClient, placeholder: "Nome completo", type: "text" },
          { label: "WhatsApp", val: phone, set: setPhone, placeholder: "(27) 99999-0000", type: "text" },
          { label: "Data de Entrega", val: deliveryDate, set: setDeliveryDate, placeholder: "", type: "date" },
          { label: "Observações", val: obs, set: setObs, placeholder: "Opcional...", type: "text" },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: 11 }}>
            <label style={lbl}>{f.label}</label>
            <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={inp} />
          </div>
        ))}
      </div>

      <div style={{ background: "var(--white)", borderRadius: "var(--radius)", padding: 16, border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: .8, marginBottom: 14 }}>Produtos</div>
        {lines.map((line, i) => {
          const prod = getProduct(line.productId);
          const lt = (prod?.price || 0) * (line.qty || 1);
          return (
            <div key={i} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                <select value={line.productId || prod?._id} onChange={e => updateLine(i, "productId", e.target.value)} style={{ ...inp, flex: 1, minWidth: 140 }}>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name} – {fmtMoney(p.price)}</option>)}
                </select>
                <input type="number" min="1" value={line.qty} onChange={e => updateLine(i, "qty", Math.max(1, parseInt(e.target.value) || 1))} style={{ ...inp, width: 60 }} />
                <div style={{ fontWeight: 900, color: "var(--caramel)", fontSize: 13, minWidth: 68, textAlign: "right" }}>{fmtMoney(lt)}</div>
                {lines.length > 1 && <button onClick={() => setLines(lines.filter((_, idx) => idx !== i))} style={{ padding: "7px 10px", background: "#fff0ee", border: "2px solid #f5c0b8", color: "#c0392b", borderRadius: "var(--radius)", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>✕</button>}
              </div>
              {prod?.hasFillings && (
                <div style={{ marginTop: 8 }}>
                  <label style={lbl}>Recheio</label>
                  <select value={line.filling} onChange={e => updateLine(i, "filling", e.target.value)} style={inp}>
                    <option value="">Escolher recheio...</option>
                    {prod.fillings.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              )}
            </div>
          );
        })}
        <button onClick={() => setLines([...lines, { productId: "", qty: 1, filling: "" }])} style={{ width: "100%", padding: 10, background: "#fdf4ef", border: "2px solid var(--border)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: 13, fontWeight: 800, cursor: "pointer", marginTop: 4, fontFamily: "inherit" }}>
          + Adicionar produto
        </button>
        <div style={{ background: "var(--caramel)", color: "#fff", padding: "12px 15px", borderRadius: "var(--radius)", marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 900, fontSize: 17 }}>
          <span>Total</span><span>{fmtMoney(total)}</span>
        </div>
        <button onClick={save} style={{ width: "100%", padding: 13, background: "var(--caramel)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 11, fontFamily: "inherit" }}>
          Salvar Pedido
        </button>
      </div>
    </div>
  );
}
