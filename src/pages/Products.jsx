import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function fmtMoney(v) {
  return "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const inp = { width: "100%", padding: "11px 12px", border: "2px solid var(--border)", borderRadius: "var(--radius)", fontSize: 14, color: "var(--text)", background: "#fdf4ef", outline: "none", fontFamily: "inherit" };
const lbl = { display: "block", fontSize: 11, fontWeight: 800, color: "var(--muted)", marginBottom: 4, letterSpacing: .4, textTransform: "uppercase" };

const EMPTY = { name: "", price: "", desc: "", hasFillings: false, fillingsText: "" };

export default function Products() {
  const products = useQuery(api.products.list) ?? [];
  const addProduct = useMutation(api.products.add);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);

  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function startEdit(p) {
    setForm({ name: p.name, price: String(p.price), desc: p.desc, hasFillings: p.hasFillings, fillingsText: p.fillings.join("\n") });
    setEditId(p._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelForm() {
    setForm(EMPTY); setEditId(null); setShowForm(false);
  }

  async function saveForm() {
    const name = form.name.trim();
    const price = parseFloat(form.price);
    if (!name || isNaN(price)) { alert("Preencha nome e preço!"); return; }
    const fillings = form.hasFillings ? form.fillingsText.split("\n").map(s => s.trim()).filter(Boolean) : [];
    const data = { name, price, desc: form.desc.trim(), hasFillings: form.hasFillings, fillings };
    if (editId) {
      await updateProduct({ id: editId, ...data });
    } else {
      await addProduct(data);
    }
    cancelForm();
  }

  return (
    <div>
      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ width: "100%", padding: 13, background: "var(--caramel)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", marginBottom: 14 }}>
          + Novo Produto
        </button>
      )}

      {showForm && (
        <div style={{ background: "var(--white)", borderRadius: "var(--radius)", padding: 16, marginBottom: 14, border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: .8, marginBottom: 14 }}>
            {editId ? "Editar Produto" : "Novo Produto"}
          </div>
          <div style={{ marginBottom: 11 }}><label style={lbl}>Nome</label>
            <input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ex: Petisqueira Coelhinho" />
          </div>
          <div style={{ marginBottom: 11 }}><label style={lbl}>Preço (R$)</label>
            <input style={inp} type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0,00" step="0.01" />
          </div>
          <div style={{ marginBottom: 11 }}><label style={lbl}>Descrição</label>
            <input style={inp} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Ingredientes, detalhes..." />
          </div>
          <div style={{ marginBottom: 11 }}>
            <label style={lbl}>Tem recheios?</label>
            <select style={inp} value={form.hasFillings ? "true" : "false"} onChange={e => setForm({ ...form, hasFillings: e.target.value === "true" })}>
              <option value="false">Não</option>
              <option value="true">Sim – cliente escolhe</option>
            </select>
          </div>
          {form.hasFillings && (
            <div style={{ marginBottom: 11 }}>
              <label style={lbl}>Recheios (um por linha)</label>
              <textarea style={{ ...inp, height: 120, resize: "vertical" }} value={form.fillingsText}
                onChange={e => setForm({ ...form, fillingsText: e.target.value })}
                placeholder={"Ferrero Rocher\nNozes & Doce de Leite\nCocada Cremosa"} />
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveForm} style={{ flex: 1, padding: 12, background: "var(--caramel)", color: "#fff", border: "none", borderRadius: "var(--radius)", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              {editId ? "Salvar" : "Adicionar"}
            </button>
            <button onClick={cancelForm} style={{ padding: "12px 16px", background: "#fdf4ef", border: "2px solid var(--border)", color: "var(--muted)", borderRadius: "var(--radius)", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{ background: "var(--white)", borderRadius: "var(--radius)", padding: 16, border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: .8, marginBottom: 14 }}>Produtos Cadastrados</div>
        {!products.length
          ? <div style={{ textAlign: "center", padding: 32, color: "var(--muted)", fontWeight: 700 }}>Nenhum produto</div>
          : products.map(p => (
            <div key={p._id} style={{ padding: 12, background: "#fdf4ef", borderRadius: "var(--radius)", marginBottom: 8, border: "1.5px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{p.desc}</div>
                  {p.hasFillings && <div style={{ fontSize: 11, color: "var(--caramel)", marginTop: 4, fontWeight: 700 }}>{p.fillings.length} recheios: {p.fillings.join(", ")}</div>}
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 15, color: "var(--caramel)" }}>{fmtMoney(p.price)}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => startEdit(p)} style={{ padding: "6px 11px", background: "var(--white)", border: "2px solid var(--border)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Editar</button>
                    <button onClick={() => { if (confirm("Remover produto?")) removeProduct({ id: p._id }); }} style={{ padding: "6px 11px", background: "#fff0ee", border: "2px solid #f5c0b8", color: "#c0392b", borderRadius: "var(--radius)", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>✕</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
