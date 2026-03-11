import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function fmtMoney(v) {
  return "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export default function NewOrder({ goTo }) {
  const products = useQuery(api.products.list) ?? [];
  const addOrder = useMutation(api.orders.add);

  const [client, setClient] = useState("");
  const [phone, setPhone] = useState("");
  const [obs, setObs] = useState("");
  const [lines, setLines] = useState([{ productId: "", qty: 1, filling: "" }]);

  function setLine(i, patch) {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, ...patch } : l));
  }
  function addLine() {
    setLines(prev => [...prev, { productId: products[0]?._id ?? "", qty: 1, filling: "" }]);
  }
  function removeLine(i) {
    setLines(prev => prev.filter((_, idx) => idx !== i));
  }

  const total = lines.reduce((s, l) => {
    const p = products.find(x => x._id === l.productId);
    return s + (p?.price ?? 0) * (l.qty || 1);
  }, 0);

  async function save() {
    if (!client.trim()) { alert("Informe o nome do cliente!"); return; }
    const mapped = lines.map(l => {
      const p = products.find(x => x._id === l.productId);
      return {
        productId: l.productId,
        productName: p?.name ?? "",
        price: p?.price ?? 0,
        qty: l.qty || 1,
        filling: l.filling || "",
      };
    });
    await addOrder({
      client: client.trim(),
      phone: phone.trim() || undefined,
      obs: obs.trim() || undefined,
      lines: mapped,
      total,
      status: "Pendente",
      date: new Date().toLocaleDateString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      }),
    });
    alert(`Pedido de ${client} salvo!`);
    goTo("orders");
  }

  return (
    <div className="fade-up">
      <div className="card">
        <div className="card-title">Dados do Cliente</div>
        <div className="form-group">
          <label>Nome</label>
          <input type="text" placeholder="Nome completo" value={client} onChange={e => setClient(e.target.value)} />
        </div>
        <div className="form-group">
          <label>WhatsApp</label>
          <input type="text" placeholder="(27) 99999-0000" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Observações</label>
          <input type="text" placeholder="Opcional..." value={obs} onChange={e => setObs(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="card-title">Produtos</div>

        {lines.map((line, i) => {
          const prod = products.find(p => p._id === line.productId) ?? products[0];
          const lineTotal = (prod?.price ?? 0) * (line.qty || 1);
          return (
            <div key={i} style={{
              display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center",
              borderBottom: "1px solid var(--border)", paddingBottom: 9, marginBottom: 9
            }}>
              <select
                style={{ flex: 1, minWidth: 138 }}
                value={line.productId}
                onChange={e => setLine(i, { productId: e.target.value, filling: "" })}
              >
                {!line.productId && <option value="">Selecione...</option>}
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name} – {fmtMoney(p.price)}</option>
                ))}
              </select>

              <input
                type="number" min="1" value={line.qty} style={{ width: 58 }}
                onChange={e => setLine(i, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
              />

              <div style={{ fontWeight: 900, color: "var(--caramel)", fontSize: 13, minWidth: 65, textAlign: "right" }}>
                {fmtMoney(lineTotal)}
              </div>

              {lines.length > 1 && (
                <button className="btn-danger btn-sm" onClick={() => removeLine(i)}>✕</button>
              )}

              {prod?.hasFillings && (
                <div style={{ flexBasis: "100%", paddingBottom: 4 }}>
                  <label>Recheio</label>
                  <select
                    value={line.filling}
                    onChange={e => setLine(i, { filling: e.target.value })}
                    style={{ marginTop: 3 }}
                  >
                    <option value="">Escolher recheio...</option>
                    {prod.fillings.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}

        <button className="btn-secondary" onClick={addLine} style={{ width: "100%", marginTop: 4 }}>
          + Adicionar produto
        </button>

        <div style={{
          background: "var(--caramel)", color: "#fff",
          padding: "12px 15px", borderRadius: "var(--radius)",
          marginTop: 9, display: "flex", justifyContent: "space-between",
          alignItems: "center", fontWeight: 900, fontSize: 17
        }}>
          <span>Total</span>
          <span>{fmtMoney(total)}</span>
        </div>

        <button className="btn-primary" onClick={save} style={{ marginTop: 11 }}>
          Salvar Pedido
        </button>
      </div>
    </div>
  );
}
