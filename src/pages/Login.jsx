import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    if (user === "zuca" && pass === "pascoa2026") onLogin();
    else setErr("Usuário ou senha incorretos");
  }

  const inputStyle = {
    width: "100%", padding: "12px 14px", border: "2px solid var(--border)",
    borderRadius: "var(--radius)", fontSize: 15, color: "var(--text)",
    background: "#fdf4ef", marginBottom: 10, outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--rose)", padding: 24,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "40px 32px",
        width: "100%", maxWidth: 360, boxShadow: "0 8px 32px rgba(90,50,30,0.15)", textAlign: "center",
      }}>
        <img src="/logo.png" alt="Zuca" style={{ height: 72, margin: "0 auto 8px", display: "block" }} />
        <div style={{ color: "var(--muted)", fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 28 }}>
          Páscoa 2026
        </div>
        <input type="text" value={user} placeholder="Usuário" onChange={e => setUser(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()} style={inputStyle} autoComplete="username" />
        <input type="password" value={pass} placeholder="Senha" onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()} style={inputStyle} autoComplete="current-password" />
        <button onClick={submit} style={{
          width: "100%", padding: 13, background: "var(--caramel)", color: "#fff",
          border: "none", borderRadius: "var(--radius)", fontSize: 15, fontWeight: 800,
          cursor: "pointer", fontFamily: "inherit",
        }}>Entrar</button>
        {err && <div style={{ color: "#c0392b", fontSize: 13, marginTop: 10, fontWeight: 700 }}>{err}</div>}
      </div>
    </div>
  );
}
