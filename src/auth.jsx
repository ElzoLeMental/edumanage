import { useState, useEffect } from "react";
import { auth as authService, users as usersApi } from "./services/api.js";

// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#1B3A6B", secondary: "#2563EB", accent: "#F59E0B",
  success: "#10B981", danger: "#EF4444", warning: "#F97316",
  bg: "#F0F4FF", card: "#FFFFFF", text: "#0F172A", muted: "#64748B",
  border: "#E2E8F0",
};

const ROLES = {
  admin:       { label: "Administrateur",    color: "#1B3A6B", permissions: ["all"] },
  enseignant:  { label: "Enseignant",        color: "#2563EB", permissions: ["eleves","classes","emploi","absences","cahier","rapports"] },
  eleve:       { label: "Élève",             color: "#8B5CF6", permissions: ["emploi","cahier","rapports"] },
  parent:      { label: "Parent d'élève",    color: "#64748B", permissions: ["mes-enfants","emploi","cahier","rapports"] },
  comptable:   { label: "Comptable",         color: "#10B981", permissions: ["finances","rapports"] },
};

const INITIAL_USERS = [
  { id: 1, nom: "Diallo",  prenom: "Mariama",  email: "admin@geschool.sn",      role: "admin",      statut: "actif",   lastLogin: "Aujourd'hui 09:15", avatar: "DM" },
  { id: 2, nom: "Mbaye",   prenom: "Ibrahima", email: "i.mbaye@geschool.sn",    role: "enseignant", statut: "actif",   lastLogin: "Hier 17:40",        avatar: "MI" },
  { id: 3, nom: "Gueye",   prenom: "Fatou",    email: "f.gueye@geschool.sn",    role: "enseignant", statut: "actif",   lastLogin: "Hier 14:20",        avatar: "GF" },
  { id: 4, nom: "Diallo",  prenom: "Aminata",  email: "a.diallo@eleve.sn",      role: "eleve",      statut: "actif",   lastLogin: "Aujourd'hui 08:00", avatar: "DA" },
  { id: 5, nom: "Ba",      prenom: "Cheikh",   email: "parent.ba@gmail.com",    role: "parent",     statut: "actif",   lastLogin: "Il y a 1 semaine",  avatar: "BC" },
  { id: 6, nom: "Sow",     prenom: "Adja",     email: "a.sow@geschool.sn",      role: "comptable",  statut: "actif",   lastLogin: "Aujourd'hui 10:02", avatar: "SA" },
];

const DEMO_CREDENTIALS = [
  { email: "admin@geschool.sn",     password: "Admin@2024",  role: "admin" },
  { email: "i.mbaye@geschool.sn",   password: "Prof@2024",   role: "enseignant" },
  { email: "a.diallo@eleve.sn",     password: "Eleve@2024",  role: "eleve" },
  { email: "parent.ba@gmail.com",   password: "Parent@2024", role: "parent" },
  { email: "a.sow@geschool.sn",     password: "Compta@2024", role: "comptable" },
];

// ─── ICÔNES ──────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const icons = {
    eye:      <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    eye_off:  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    user:     <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    lock:     <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    shield:   <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    plus:     <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    edit:     <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash:    <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    check:    <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    x:        <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    logout:   <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    award:    <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
    mail:     <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    key:      <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
    search:   <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    users:    <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    alert:    <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  };
  return icons[name] || null;
};

// ─── PAGE DE CONNEXION ────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    const result = await authService.login(email, password);
    if (result.ok) {
      onLogin(result.user);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const fillDemo = (cred) => {
    setSelectedDemo(cred.email);
    setEmail(cred.email);
    setPassword(cred.password);
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${COLORS.primary} 0%, #0F2347 60%, #1B3A6B 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans','Segoe UI',sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .btn { transition: all 0.2s; cursor: pointer; border: none; }
        .btn:hover { opacity: 0.88; transform: translateY(-1px); }
        input { outline: none; transition: all 0.2s; }
        input:focus { border-color: #2563EB !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.15) !important; }
        .demo-chip { transition: all 0.2s; cursor: pointer; }
        .demo-chip:hover { transform: translateY(-1px); }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .card-anim { animation: fadeIn 0.5s ease forwards; }
      `}</style>

      {/* Décorations */}
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ position: "absolute", borderRadius: "50%", background: "rgba(255,255,255,0.03)", width: [300,200,150,400,100][i], height: [300,200,150,400,100][i], top: ["10%","60%","-5%","40%","80%"][i], left: ["-5%","70%","80%","-10%","50%"][i], animation: `float ${4+i}s ease-in-out infinite`, animationDelay: `${i*0.5}s` }} />
      ))}

      <div className="card-anim" style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,#F59E0B,#FBBF24)", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(245,158,11,0.4)", marginBottom: 16 }}>
            <Icon name="award" size={30} color="#fff" />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>EduManage</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 }}>Lycée El Hadj Malick Sy — Espace sécurisé</p>
        </div>

        {/* Carte login */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 36, boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>Connexion</h2>
          <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 28 }}>Accédez à votre espace de gestion</p>

          {error && (
            <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="alert" size={16} color={COLORS.danger} />
              <span style={{ fontSize: 13, color: "#991B1B", fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Adresse email</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                  <Icon name="mail" size={16} color={COLORS.muted} />
                </div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required
                  style={{ width: "100%", padding: "11px 12px 11px 38px", border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, color: COLORS.text, background: COLORS.bg }} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Mot de passe</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                  <Icon name="lock" size={16} color={COLORS.muted} />
                </div>
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  style={{ width: "100%", padding: "11px 40px 11px 38px", border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, color: COLORS.text, background: COLORS.bg }} />
                <button type="button" className="btn" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", padding: 4 }}>
                  <Icon name={showPassword ? "eye_off" : "eye"} size={16} color={COLORS.muted} />
                </button>
              </div>
            </div>

            <button type="submit" className="btn" disabled={loading}
              style={{ width: "100%", padding: 13, background: loading ? COLORS.muted : `linear-gradient(135deg,${COLORS.secondary},${COLORS.primary})`, color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15, boxShadow: "0 4px 12px rgba(37,99,235,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Connexion...</> : <><Icon name="shield" size={16} color="#fff" /> Se connecter</>}
            </button>
          </form>

          {/* Comptes démo */}
          <div style={{ marginTop: 28, borderTop: `1px solid ${COLORS.border}`, paddingTop: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, textAlign: "center" }}>Comptes de démonstration</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {DEMO_CREDENTIALS.map((cred, i) => {
                const role = INITIAL_USERS.find(u => u.email === cred.email)?.role;
                const r = ROLES[role];
                return (
                  <div key={i} className="demo-chip" onClick={() => fillDemo(cred)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${selectedDemo === cred.email ? r.color : COLORS.border}`, background: selectedDemo === cred.email ? `${r.color}12` : COLORS.bg, cursor: "pointer" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: r.color }}>{r.label}</div>
                    <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cred.email}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── GESTION UTILISATEURS ─────────────────────────────────────────────────────
const normalizeUser = (u) => ({
  ...u,
  nom: u.last_name || u.nom || "",
  prenom: u.first_name || u.prenom || "",
  statut: u.statut || (u.is_active !== undefined ? (u.is_active ? "actif" : "inactif") : "actif"),
  avatar: u.avatar || `${(u.first_name || u.prenom || "")[0] || ""}${(u.last_name || u.nom || "")[0] || ""}`.toUpperCase(),
  lastLogin: u.lastLogin || (u.date_joined ? new Date(u.date_joined).toLocaleDateString("fr-FR") : "Jamais"),
});

export function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("tous");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showPermissions, setShowPermissions] = useState(null);
  const [permEdit, setPermEdit] = useState([]);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", role: "eleve", statut: "actif", password: "" });

  useEffect(() => {
    usersApi.list().then(data => {
      if (Array.isArray(data)) setUsers(data.map(normalizeUser));
    }).catch(() => {});
  }, []);

  const canManage = currentUser?.role === "admin";

  const filtered = users.filter(u => {
    const matchSearch = `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "tous" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const openCreate = () => { setForm({ nom: "", prenom: "", email: "", role: "eleve", statut: "actif", password: "" }); setEditUser(null); setShowModal(true); };
  const openEdit = (u) => { setForm({ nom: u.nom, prenom: u.prenom, email: u.email, role: u.role, statut: u.statut, password: "" }); setEditUser(u); setShowModal(true); };

  const saveUser = async () => {
    if (!form.nom || !form.prenom || !form.email) return;
    const payload = {
      first_name: form.prenom, last_name: form.nom,
      email: form.email, role: form.role,
      is_active: form.statut === "actif",
    };
    if (editUser) {
      const updated = await usersApi.update(editUser.id, payload);
      if (updated?.id) setUsers(prev => prev.map(u => u.id === editUser.id ? normalizeUser(updated) : u));
    } else {
      if (!form.password) return;
      const created = await usersApi.create({ ...payload, password: form.password });
      if (created?.id) setUsers(prev => [...prev, normalizeUser(created)]);
    }
    setShowModal(false);
  };

  const deleteUser = async (id) => {
    if (id === currentUser?.id) return;
    await usersApi.delete(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const savePermissions = async () => {
    const updated = await usersApi.update(showPermissions.id, { custom_permissions: permEdit });
    if (updated?.id) {
      setUsers(prev => prev.map(u => u.id === showPermissions.id
        ? { ...normalizeUser(updated), permissions: permEdit }
        : u));
    }
    setShowPermissions(null);
  };

  const toggleStatus = async (id) => {
    const u = users.find(x => x.id === id);
    if (!u) return;
    const updated = await usersApi.update(id, { is_active: u.statut !== "actif" });
    if (updated?.id) setUsers(prev => prev.map(x => x.id === id ? normalizeUser(updated) : x));
  };

  const PERM_LABELS = { users: "Utilisateurs", eleves: "Élèves", enseignants: "Enseignants", classes: "Classes", finances: "Finances", emploi: "Emploi du temps", absences: "Absences", cahier: "Cahier de texte", "mes-enfants": "Mes enfants", rapports: "Rapports" };

  return (
    <div>
      <style>{`
        .btn { transition: all 0.2s; cursor: pointer; border: none; }
        .btn:hover { opacity: 0.88; }
        .row-hover:hover { background: #F8FAFF !important; }
        input,select { outline: none; transition: border 0.2s; }
        input:focus,select:focus { border-color: #2563EB !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important; }
        @keyframes fadeIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        .modal-anim { animation: fadeIn 0.2s ease; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: COLORS.text }}>Gestion des Utilisateurs</h1>
          <p style={{ color: COLORS.muted, fontSize: 14, marginTop: 4 }}>{users.length} comptes enregistrés · Rôles et permissions</p>
        </div>
        {canManage && (
          <button className="btn" onClick={openCreate} style={{ background: COLORS.secondary, color: "#fff", padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="plus" size={16} color="#fff" /> Nouvel utilisateur
          </button>
        )}
      </div>

      {/* Stats rapides */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 24 }}>
        {Object.entries(ROLES).map(([key, r]) => {
          const count = users.filter(u => u.role === key).length;
          return (
            <div key={key} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${r.color}` }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: r.color }}>{count}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{r.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
            <Icon name="search" size={15} color={COLORS.muted} />
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un utilisateur..."
            style={{ width: "100%", padding: "9px 12px 9px 32px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: "#fff", color: COLORS.text }} />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          style={{ padding: "9px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: "#fff", color: COLORS.text, cursor: "pointer" }}>
          <option value="tous">Tous les rôles</option>
          {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: COLORS.bg }}>
              {["Utilisateur", "Rôle", "Permissions", "Dernier accès", "Statut", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => {
              const r = ROLES[u.role];
              const perms = u.permissions?.length >= 0 ? u.permissions : (r?.permissions?.[0] === "all" ? Object.keys(PERM_LABELS) : r?.permissions || []);
              return (
                <tr key={u.id} className="row-hover" style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                  {/* Utilisateur */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${r.color},${r.color}99)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {u.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.text }}>{u.prenom} {u.nom}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  {/* Rôle */}
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: `${r.color}18`, color: r.color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{r.label}</span>
                  </td>
                  {/* Permissions */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 200 }}>
                      {perms.slice(0, 3).map(p => (
                        <span key={p} style={{ background: COLORS.bg, color: COLORS.muted, padding: "2px 7px", borderRadius: 6, fontSize: 10, fontWeight: 500 }}>{PERM_LABELS[p]}</span>
                      ))}
                      {perms.length > 3 && (
                        <button className="btn" onClick={() => { setShowPermissions(u); setPermEdit(u.permissions || []); }}
                          style={{ background: `${COLORS.secondary}18`, color: COLORS.secondary, padding: "2px 7px", borderRadius: 6, fontSize: 10, fontWeight: 600 }}>
                          +{perms.length - 3}
                        </button>
                      )}
                    </div>
                  </td>
                  {/* Dernier accès */}
                  <td style={{ padding: "14px 16px", fontSize: 12, color: COLORS.muted }}>{u.lastLogin}</td>
                  {/* Statut */}
                  <td style={{ padding: "14px 16px" }}>
                    {canManage ? (
                      <button className="btn" onClick={() => toggleStatus(u.id)}
                        style={{ background: u.statut === "actif" ? "#D1FAE5" : "#FEE2E2", color: u.statut === "actif" ? "#065F46" : "#991B1B", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {u.statut === "actif" ? "● Actif" : "○ Inactif"}
                      </button>
                    ) : (
                      <span style={{ background: u.statut === "actif" ? "#D1FAE5" : "#FEE2E2", color: u.statut === "actif" ? "#065F46" : "#991B1B", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {u.statut === "actif" ? "● Actif" : "○ Inactif"}
                      </span>
                    )}
                  </td>
                  {/* Actions */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {canManage && (
                        <>
                          <button className="btn" onClick={() => openEdit(u)} style={{ background: `${COLORS.secondary}15`, padding: "6px", borderRadius: 7 }}>
                            <Icon name="edit" size={14} color={COLORS.secondary} />
                          </button>
                          {u.id !== currentUser?.id && (
                            <button className="btn" onClick={() => deleteUser(u.id)} style={{ background: "#FEE2E2", padding: "6px", borderRadius: 7 }}>
                              <Icon name="trash" size={14} color={COLORS.danger} />
                            </button>
                          )}
                        </>
                      )}
                      <button className="btn" onClick={() => { setShowPermissions(u); setPermEdit(u.permissions || []); }} style={{ background: `${COLORS.accent}20`, padding: "6px", borderRadius: 7 }}>
                        <Icon name="key" size={14} color={COLORS.accent} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>
            <Icon name="users" size={32} color={COLORS.border} />
            <p style={{ marginTop: 8, fontSize: 14 }}>Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Modal créer/éditer */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div className="modal-anim" style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 460, boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: COLORS.text }}>{editUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</h3>
              <button className="btn" onClick={() => setShowModal(false)} style={{ background: COLORS.bg, padding: 6, borderRadius: 8 }}>
                <Icon name="x" size={16} color={COLORS.muted} />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[["Prénom", "prenom", "text"], ["Nom", "nom", "text"]].map(([label, key, type]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, color: COLORS.text, background: COLORS.bg }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, color: COLORS.text, background: COLORS.bg }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>Rôle</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.bg, color: COLORS.text, cursor: "pointer" }}>
                  {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>Statut</label>
                <select value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.bg, color: COLORS.text, cursor: "pointer" }}>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>
            {/* Mot de passe (création seulement) */}
            {!editUser && (
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>Mot de passe</label>
                <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 8 caractères"
                  style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, color: COLORS.text, background: COLORS.bg }} />
              </div>
            )}
            {/* Preview permissions */}
            <div style={{ marginTop: 16, background: COLORS.bg, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Permissions accordées</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(ROLES[form.role]?.permissions[0] === "all" ? Object.keys(PERM_LABELS) : ROLES[form.role]?.permissions || []).map(p => (
                  <span key={p} style={{ background: "#fff", border: `1px solid ${COLORS.border}`, color: COLORS.text, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon name="check" size={10} color={COLORS.success} /> {PERM_LABELS[p]}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button className="btn" onClick={() => setShowModal(false)} style={{ flex: 1, padding: 12, background: COLORS.bg, color: COLORS.muted, borderRadius: 10, fontWeight: 600, fontSize: 14 }}>Annuler</button>
              <button className="btn" onClick={saveUser} style={{ flex: 2, padding: 12, background: `linear-gradient(135deg,${COLORS.secondary},${COLORS.primary})`, color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                {editUser ? "Mettre à jour" : "Créer le compte"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal permissions */}
      {showPermissions && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div className="modal-anim" style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 400, boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: COLORS.text }}>Modifier les permissions</h3>
              <button className="btn" onClick={() => setShowPermissions(null)} style={{ background: COLORS.bg, padding: 6, borderRadius: 8 }}>
                <Icon name="x" size={16} color={COLORS.muted} />
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: COLORS.bg, borderRadius: 10, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg,${ROLES[showPermissions.role]?.color},${ROLES[showPermissions.role]?.color}99)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>{showPermissions.avatar}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.text }}>{showPermissions.prenom} {showPermissions.nom}</div>
                <span style={{ background: `${ROLES[showPermissions.role]?.color}18`, color: ROLES[showPermissions.role]?.color, padding: "1px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{ROLES[showPermissions.role]?.label}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(PERM_LABELS).map(([key, label]) => {
                const checked = permEdit.includes(key);
                return (
                  <label key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: checked ? "#F0FDF4" : COLORS.bg, borderRadius: 8, border: `1px solid ${checked ? "#BBF7D0" : COLORS.border}`, cursor: "pointer" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.text }}>{label}</span>
                    <input type="checkbox" checked={checked} onChange={() => setPermEdit(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key])}
                      style={{ width: 18, height: 18, accentColor: COLORS.success, cursor: "pointer" }} />
                  </label>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn" onClick={() => setShowPermissions(null)} style={{ flex: 1, padding: 11, background: COLORS.bg, color: COLORS.muted, borderRadius: 10, fontWeight: 600, fontSize: 14 }}>Annuler</button>
              <button className="btn" onClick={savePermissions} style={{ flex: 2, padding: 11, background: `linear-gradient(135deg,${COLORS.secondary},${COLORS.primary})`, color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>Sauvegarder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EXPORT AUTH ──────────────────────────────────────────────────────────────
export { LoginPage, ROLES, INITIAL_USERS };
export default LoginPage;
