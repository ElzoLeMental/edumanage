import { useState, useEffect } from "react";
import { UserManagement, ROLES } from "./auth.jsx";
import { dashboard as dashboardApi, eleves as elevesApi, enseignants as enseignantsApi, classes as classesApi, finances as financesApi, emploi as emploiApi, absences as absencesApi, cahier as cahierApi, users as usersApi } from "./services/api.js";

const COLORS = {
  primary: "#1B3A6B",
  secondary: "#2563EB",
  accent: "#F59E0B",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F97316",
  bg: "#F0F4FF",
  card: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
};

const mockData = {
  stats: {
    eleves: 1247,
    enseignants: 84,
    classes: 42,
    tauxReussite: 91.4,
    revenus: 284500,
    depenses: 198300,
  },
  eleves: [
    { id: 1, nom: "Diallo", prenom: "Aminata", classe: "Terminale S1", moyenne: 15.4, statut: "actif", frais: "payé" },
    { id: 2, nom: "Ndiaye", prenom: "Mamadou", classe: "Première L2", moyenne: 12.8, statut: "actif", frais: "partiel" },
    { id: 3, nom: "Sow", prenom: "Fatou", classe: "Seconde A", moyenne: 17.2, statut: "actif", frais: "payé" },
    { id: 4, nom: "Ba", prenom: "Ibrahima", classe: "Terminale S2", moyenne: 9.1, statut: "suspendu", frais: "impayé" },
    { id: 5, nom: "Fall", prenom: "Rokhaya", classe: "Troisième", moyenne: 14.5, statut: "actif", frais: "payé" },
    { id: 6, nom: "Touré", prenom: "Ousmane", classe: "Première S1", moyenne: 11.3, statut: "actif", frais: "partiel" },
  ],
  enseignants: [
    { id: 1, nom: "Prof. Mbaye", matiere: "Mathématiques", classes: 6, heures: 22, contrat: "titulaire" },
    { id: 2, nom: "Prof. Gueye", matiere: "Français & Lettres", classes: 5, heures: 18, contrat: "vacataire" },
    { id: 3, nom: "Prof. Diop", matiere: "Sciences Physiques", classes: 4, heures: 20, contrat: "titulaire" },
    { id: 4, nom: "Prof. Kane", matiere: "Histoire-Géographie", classes: 7, heures: 24, contrat: "titulaire" },
    { id: 5, nom: "Prof. Sarr", matiere: "Anglais", classes: 5, heures: 16, contrat: "vacataire" },
  ],
  classes: [
    { id: 1, nom: "Terminale S1", effectif: 38, titulaire: "Prof. Mbaye", salle: "A101", emploi: "Complet" },
    { id: 2, nom: "Terminale S2", effectif: 35, titulaire: "Prof. Diop", salle: "A102", emploi: "Complet" },
    { id: 3, nom: "Première L1", effectif: 42, titulaire: "Prof. Gueye", salle: "B201", emploi: "Partiel" },
    { id: 4, nom: "Première S1", effectif: 40, titulaire: "Prof. Kane", salle: "B202", emploi: "Complet" },
    { id: 5, nom: "Seconde A", effectif: 44, titulaire: "Prof. Sarr", salle: "C301", emploi: "Partiel" },
  ],
  finances: [
    { id: 1, type: "recette", libelle: "Frais de scolarité T1", montant: 124500, date: "2024-01-15", statut: "encaissé" },
    { id: 2, type: "depense", libelle: "Salaires enseignants", montant: 89400, date: "2024-01-31", statut: "payé" },
    { id: 3, type: "recette", libelle: "Droits d'inscription", montant: 48200, date: "2024-01-05", statut: "encaissé" },
    { id: 4, type: "depense", libelle: "Fournitures scolaires", montant: 12800, date: "2024-01-20", statut: "payé" },
    { id: 5, type: "recette", libelle: "Frais cantine", montant: 31800, date: "2024-02-01", statut: "partiel" },
    { id: 6, type: "depense", libelle: "Maintenance bâtiments", montant: 18500, date: "2024-02-10", statut: "en attente" },
  ],
  emploiDuTemps: [
    { heure: "08h-09h", lundi: "Maths - TS1", mardi: "Français - PL1", mercredi: "Physique - TS2", jeudi: "Anglais - 2A", vendredi: "Histoire - PS1" },
    { heure: "09h-10h", lundi: "Physique - TS1", mardi: "Maths - PS1", mercredi: "Français - PL1", jeudi: "Maths - TS2", vendredi: "SVT - TS1" },
    { heure: "10h-11h", lundi: "Anglais - PL1", mardi: "Histoire - TS1", mercredi: "Maths - 2A", jeudi: "Physique - PS1", vendredi: "Maths - TS1" },
    { heure: "11h-12h", lundi: "Histoire - 2A", mardi: "Physique - TS2", mercredi: "Anglais - TS1", jeudi: "Français - 2A", vendredi: "Physique - TS2" },
    { heure: "14h-15h", lundi: "SVT - TS2", mardi: "Anglais - PS1", mercredi: "Histoire - TS2", jeudi: "SVT - PL1", vendredi: "Anglais - TS2" },
    { heure: "15h-16h", lundi: "Français - TS2", mardi: "SVT - 2A", mercredi: "Physique - PL1", jeudi: "Maths - PL1", vendredi: "Français - PS1" },
  ],
};

const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    dashboard: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    students: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    teachers: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
    classes: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    finance: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    schedule: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    reports: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    bell: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    search: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    plus: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    menu: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    trend_up: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    settings: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    logout: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    user: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    award: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
    edit: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    x: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    absence: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="23" y2="14"/><line x1="23" y1="8" x2="17" y2="14"/></svg>,
    cahier: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/></svg>,
  };
  return icons[name] || null;
};

const Badge = ({ label, color }) => {
  const colorMap = {
    payé: { bg: "#D1FAE5", text: "#065F46" },
    partiel: { bg: "#FEF3C7", text: "#92400E" },
    impayé: { bg: "#FEE2E2", text: "#991B1B" },
    actif: { bg: "#DBEAFE", text: "#1E40AF" },
    suspendu: { bg: "#F3E8FF", text: "#6B21A8" },
    encaissé: { bg: "#D1FAE5", text: "#065F46" },
    "en attente": { bg: "#FEF3C7", text: "#92400E" },
    titulaire: { bg: "#DBEAFE", text: "#1E40AF" },
    vacataire: { bg: "#E0E7FF", text: "#3730A3" },
    payé2: { bg: "#D1FAE5", text: "#065F46" },
    Complet: { bg: "#D1FAE5", text: "#065F46" },
    Partiel: { bg: "#FEF3C7", text: "#92400E" },
  };
  const style = colorMap[label] || { bg: "#F1F5F9", text: "#475569" };
  return (
    <span style={{
      background: style.bg, color: style.text,
      padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600
    }}>{label}</span>
  );
};

export default function SchoolManagement({ currentUser, onLogout }) {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const userPerms = currentUser?.permissions || [];
  const isAdmin = currentUser?.role === "admin";
  const canAccess = (perm) => isAdmin || !perm || userPerms.includes(perm);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
    else setSidebarOpen(true);
  }, [isMobile]);

  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "dashboard" },
    { id: "users",      label: "Utilisateurs",    icon: "students",  perm: "users" },
    { id: "eleves",     label: "Élèves",           icon: "students",  perm: "eleves" },
    { id: "enseignants",label: "Enseignants",      icon: "teachers",  perm: "enseignants" },
    { id: "classes",    label: "Classes",          icon: "classes",   perm: "classes" },
    { id: "finances",   label: "Finances",         icon: "finance",   perm: "finances" },
    { id: "emploi",     label: "Emploi du temps",  icon: "schedule",  perm: "emploi" },
    { id: "absences",   label: "Absences",         icon: "absence",   perm: "absences" },
    { id: "cahier",     label: "Cahier de texte",  icon: "cahier",    perm: "cahier" },
    { id: "mes-enfants", label: "Mes enfants",     icon: "students",  perm: "mes-enfants" },
    { id: "rapports",   label: "Rapports",         icon: "reports",   perm: "rapports" },
    { id: "parametres", label: "Paramètres",       icon: "settings" },
  ].filter(item => canAccess(item.perm));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLORS.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .nav-item { transition: all 0.2s; cursor: pointer; }
        .nav-item:hover { background: rgba(255,255,255,0.12) !important; }
        .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important; }
        .table-row:hover { background: #F8FAFF !important; }
        .btn { transition: all 0.2s; cursor: pointer; border: none; }
        .btn:hover { opacity: 0.88; transform: translateY(-1px); }
        input, select { outline: none; }
        input:focus { border-color: #2563EB !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important; }
        @media (max-width: 768px) {
          .sidebar { position: fixed !important; z-index: 100; height: 100vh; }
          .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 99; }
          .main-content { margin-left: 0 !important; }
        }
      `}</style>

      {/* Sidebar */}
      {sidebarOpen && (
        <>
          {isMobile && <div className="overlay" onClick={() => setSidebarOpen(false)} />}
          <aside className="sidebar" style={{
            width: 260, background: COLORS.primary, color: "#fff",
            display: "flex", flexDirection: "column", flexShrink: 0,
            boxShadow: "4px 0 20px rgba(0,0,0,0.15)"
          }}>
            {/* Logo */}
            <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "linear-gradient(135deg, #F59E0B, #FBBF24)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(245,158,11,0.4)"
                }}>
                  <Icon name="award" size={22} color="#fff" />
                </div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px" }}>EduManage</div>
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 1 }}>Lycée El Hadj Malick Sy</div>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, opacity: 0.4, marginBottom: 8, paddingLeft: 12, textTransform: "uppercase" }}>Navigation</div>
              {navItems.filter(item => item.id !== "parametres").map(item => (
                <div key={item.id} className="nav-item" onClick={() => { setActiveModule(item.id); if (isMobile) setSidebarOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                    borderRadius: 10, marginBottom: 2,
                    background: activeModule === item.id ? "rgba(255,255,255,0.15)" : "transparent",
                    borderLeft: activeModule === item.id ? `3px solid ${COLORS.accent}` : "3px solid transparent",
                    fontWeight: activeModule === item.id ? 600 : 400, fontSize: 14,
                  }}>
                  <Icon name={item.icon} size={18} color={activeModule === item.id ? COLORS.accent : "rgba(255,255,255,0.7)"} />
                  <span style={{ opacity: activeModule === item.id ? 1 : 0.75 }}>{item.label}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", margin: "12px 0" }} />
              {navItems.filter(item => item.id === "parametres").map(item => (
                <div key={item.id} className="nav-item" onClick={() => { setActiveModule(item.id); if (isMobile) setSidebarOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                    borderRadius: 10, marginBottom: 2, fontSize: 14,
                    background: activeModule === item.id ? "rgba(255,255,255,0.15)" : "transparent",
                    borderLeft: activeModule === item.id ? `3px solid ${COLORS.accent}` : "3px solid transparent",
                  }}>
                  <Icon name={item.icon} size={18} color="rgba(255,255,255,0.6)" />
                  <span style={{ opacity: 0.7 }}>{item.label}</span>
                </div>
              ))}
            </nav>

            {/* User */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#F59E0B,#FBBF24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                {currentUser ? `${(currentUser.first_name || currentUser.prenom || "?")[0]}${(currentUser.last_name || currentUser.nom || "?")[0]}` : "??"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser ? `${currentUser.first_name || currentUser.prenom || ""} ${currentUser.last_name || currentUser.nom || ""}`.trim() : "Utilisateur"}</div>
                <div style={{ fontSize: 11, opacity: 0.5 }}>{currentUser ? ROLES[currentUser.role]?.label : ""}</div>
              </div>
              <button onClick={onLogout} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, opacity: 0.6 }} title="Déconnexion">
                <Icon name="logout" size={16} color="#fff" />
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main */}
      <div className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Topbar */}
        <header style={{
          background: "#fff", borderBottom: `1px solid ${COLORS.border}`,
          padding: "0 24px", height: 64, display: "flex", alignItems: "center",
          gap: 16, position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 8px rgba(0,0,0,0.06)"
        }}>
          <button className="btn" onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: COLORS.bg, border: "none", borderRadius: 8, padding: 8, color: COLORS.text }}>
            <Icon name="menu" size={20} color={COLORS.text} />
          </button>
          <div style={{ flex: 1, position: "relative", maxWidth: 380 }}>
            <Icon name="search" size={16} color={COLORS.muted} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher un élève, enseignant..."
              style={{
                position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13,
                background: COLORS.bg, color: COLORS.text
              }} />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <button className="btn" style={{ background: COLORS.bg, borderRadius: 8, padding: 8 }}>
                <Icon name="bell" size={20} color={COLORS.text} />
              </button>
              <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: COLORS.danger, border: "2px solid #fff" }} />
            </div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${COLORS.primary},${COLORS.secondary})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="user" size={16} color="#fff" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: "auto", padding: isMobile ? 16 : 28 }}>
          {activeModule === "dashboard" && <Dashboard isMobile={isMobile} />}
          {activeModule === "users" && <UserManagement currentUser={currentUser} />}
          {activeModule === "eleves" && <Eleves isMobile={isMobile} currentUser={currentUser} />}
          {activeModule === "enseignants" && <Enseignants isMobile={isMobile} />}
          {activeModule === "classes" && <Classes isMobile={isMobile} currentUser={currentUser} />}
          {activeModule === "finances" && <Finances isMobile={isMobile} currentUser={currentUser} />}
          {activeModule === "emploi" && <EmploiDuTemps isMobile={isMobile} currentUser={currentUser} />}
          {activeModule === "absences" && <Absences isMobile={isMobile} currentUser={currentUser} />}
          {activeModule === "cahier" && <CahierTexte isMobile={isMobile} currentUser={currentUser} />}
          {activeModule === "mes-enfants" && <MesEnfants isMobile={isMobile} currentUser={currentUser} />}
          {activeModule === "rapports" && <Rapports isMobile={isMobile} />}
          {activeModule === "parametres" && <Parametres isMobile={isMobile} />}
        </main>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: COLORS.text, letterSpacing: "-0.5px" }}>{title}</h1>
        {subtitle && <p style={{ color: COLORS.muted, fontSize: 14, marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, icon, color, sub, trend }) {
  return (
    <div className="stat-card" style={{
      background: "#fff", borderRadius: 16, padding: "22px 24px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: `1px solid ${COLORS.border}`,
      display: "flex", flexDirection: "column", gap: 12
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={20} color={color} />
        </div>
        {trend && <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.success, display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name="trend_up" size={14} color={COLORS.success} /> {trend}
        </div>}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.text, letterSpacing: "-1px" }}>{value}</div>
        <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: color, marginTop: 4, fontWeight: 500 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Dashboard({ isMobile }) {
  const [stats, setStats] = useState(mockData.stats);
  const [eleves, setEleves] = useState([]);
  const [absencesRecentes, setAbsencesRecentes] = useState([]);
  const cols = isMobile ? 1 : 3;

  useEffect(() => {
    dashboardApi.stats().then(data => {
      setStats({ eleves: data.eleves, enseignants: data.enseignants, classes: data.classes, tauxReussite: data.taux_reussite, revenus: data.revenus, depenses: data.depenses });
    }).catch(() => {});
    elevesApi.list().then(data => { if (Array.isArray(data)) setEleves(data); }).catch(() => {});
    absencesApi.list().then(data => { if (Array.isArray(data)) setAbsencesRecentes(data.slice(0, 5)); }).catch(() => {});
  }, []);

  // Top 5 élèves par moyenne
  const top5 = [...eleves]
    .filter(e => e.moyenne !== null && e.moyenne !== undefined)
    .sort((a, b) => parseFloat(b.moyenne) - parseFloat(a.moyenne))
    .slice(0, 5);

  // Alertes
  const elevesImpayes = eleves.filter(e => e.frais_statut === "impayé");
  const elevesFaibleMoyenne = eleves.filter(e => e.moyenne !== null && parseFloat(e.moyenne) < 10);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <PageHeader title="Tableau de bord" subtitle={`${new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`} />

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16, marginBottom: 28 }}>
        <StatCard label="Élèves inscrits" value={stats.eleves.toLocaleString()} icon="students" color={COLORS.secondary} sub="Élèves actifs" />
        <StatCard label="Enseignants" value={stats.enseignants} icon="teachers" color={COLORS.success} sub="Corps enseignant" />
        <StatCard label="Classes actives" value={stats.classes} icon="classes" color={COLORS.warning} sub="Toutes sections" />
        <StatCard label="Taux de réussite" value={`${stats.tauxReussite}%`} icon="award" color="#8B5CF6" sub="Moyenne ≥ 10" />
        <StatCard label="Recettes totales" value={`${(stats.revenus / 1000).toFixed(0)}K FCFA`} icon="finance" color={COLORS.success} sub="Toutes périodes" />
        <StatCard label="Dépenses totales" value={`${(stats.depenses / 1000).toFixed(0)}K FCFA`} icon="finance" color={COLORS.danger} sub="Toutes périodes" />
      </div>

      {/* Alertes */}
      {(elevesImpayes.length > 0 || elevesFaibleMoyenne.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {elevesImpayes.length > 0 && (
            <div style={{ background: `${COLORS.danger}10`, border: `1.5px solid ${COLORS.danger}30`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <Icon name="finance" size={20} color={COLORS.danger} />
              <div>
                <div style={{ fontWeight: 700, color: COLORS.danger, fontSize: 13 }}>{elevesImpayes.length} élève{elevesImpayes.length > 1 ? "s" : ""} avec frais impayés</div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Consulter le module Élèves → filtre "Impayés"</div>
              </div>
            </div>
          )}
          {elevesFaibleMoyenne.length > 0 && (
            <div style={{ background: `${COLORS.warning}10`, border: `1.5px solid ${COLORS.warning}30`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <Icon name="award" size={20} color={COLORS.warning} />
              <div>
                <div style={{ fontWeight: 700, color: COLORS.warning, fontSize: 13 }}>{elevesFaibleMoyenne.length} élève{elevesFaibleMoyenne.length > 1 ? "s" : ""} avec moyenne inférieure à 10</div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Suivi pédagogique recommandé</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr", gap: 20 }}>
        {/* Top 5 élèves */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 18 }}>Top 5 — Meilleures moyennes</h3>
          {top5.length === 0 ? (
            <div style={{ color: COLORS.muted, fontSize: 13 }}>Aucune note enregistrée.</div>
          ) : top5.map((e, i) => {
            const moy = parseFloat(e.moyenne);
            const color = moy >= 16 ? COLORS.success : moy >= 14 ? "#16A34A" : moy >= 12 ? COLORS.warning : COLORS.muted;
            return (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < top5.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "#FEF3C7" : COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: i === 0 ? COLORS.accent : COLORS.muted, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{e.prenom} {e.nom}</div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>{e.classe_nom || "—"}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, color }}>{moy.toFixed(2)}/20</div>
              </div>
            );
          })}

          {/* Absences récentes */}
          {absencesRecentes.length > 0 && (
            <>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 14, marginTop: 24 }}>Absences récentes</h3>
              {absencesRecentes.map((a, i) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < absencesRecentes.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.justifiee ? COLORS.success : COLORS.danger, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>{a.eleve_prenom} {a.eleve_nom}</span>
                    {a.matiere ? ` — ${a.matiere}` : ""}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.muted, whiteSpace: "nowrap" }}>{a.date === today ? "Aujourd'hui" : a.date}</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Résumé financier */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 18 }}>Résumé financier</h3>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>
              <span>Recettes</span>
              <span style={{ fontWeight: 600, color: COLORS.success }}>{(stats.revenus / 1000).toFixed(0)}K FCFA</span>
            </div>
            <div style={{ height: 8, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${Math.min((stats.revenus / Math.max(stats.revenus, stats.depenses, 1)) * 100, 100)}%`, height: "100%", background: COLORS.success, borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>
              <span>Dépenses</span>
              <span style={{ fontWeight: 600, color: COLORS.danger }}>{(stats.depenses / 1000).toFixed(0)}K FCFA</span>
            </div>
            <div style={{ height: 8, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${Math.min((stats.depenses / Math.max(stats.revenus, stats.depenses, 1)) * 100, 100)}%`, height: "100%", background: COLORS.danger, borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ background: COLORS.bg, borderRadius: 12, padding: 16, marginTop: 8 }}>
            <div style={{ fontSize: 12, color: COLORS.muted }}>Solde disponible</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: stats.revenus >= stats.depenses ? COLORS.primary : COLORS.danger, marginTop: 4 }}>
              {((stats.revenus - stats.depenses) / 1000).toFixed(0)}K FCFA
            </div>
            <div style={{ fontSize: 11, color: stats.revenus >= stats.depenses ? COLORS.success : COLORS.danger, marginTop: 2 }}>
              {stats.revenus >= stats.depenses ? "↑ Excédent budgétaire" : "↓ Déficit budgétaire"}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Frais de scolarité</div>
            {(() => {
              const total = eleves.length || 1;
              const payes = eleves.filter(e => e.frais_statut === "payé").length;
              const partiel = eleves.filter(e => e.frais_statut === "partiel").length;
              const impayes = eleves.filter(e => e.frais_statut === "impayé").length;
              return [
                { label: "Payés intégralement", val: payes, color: COLORS.success },
                { label: "Paiement partiel", val: partiel, color: COLORS.warning },
                { label: "Impayés", val: impayes, color: COLORS.danger },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: f.color, flexShrink: 0 }} />
                  <div style={{ fontSize: 12, color: COLORS.muted, flex: 1 }}>{f.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: f.color }}>{f.val} ({Math.round((f.val / total) * 100)}%)</div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

function DataTable({ columns, data, isMobile }) {
  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.map((row, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 16, border: `1px solid ${COLORS.border}` }}>
            {columns.map(col => (
              <div key={col.key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: COLORS.muted, fontWeight: 500 }}>{col.label}</span>
                <span style={{ color: COLORS.text, fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: COLORS.bg }}>
            {columns.map(col => (
              <th key={col.key} style={{ padding: "12px 18px", textAlign: "left", fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${COLORS.border}` }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="table-row" style={{ borderBottom: i < data.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
              {columns.map(col => (
                <td key={col.key} style={{ padding: "13px 18px", fontSize: 13, color: COLORS.text }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const EMPTY_FORM_ELEVE = { prenom: "", nom: "", email: "", classe: "", statut: "actif", mois_payes: 0, date_naissance: "" };

function Eleves({ isMobile, currentUser }) {
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "comptable";
  const [filter, setFilter] = useState("tous");
  const [search, setSearch] = useState("");
  const [eleves, setEleves] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editEleve, setEditEleve] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM_ELEVE);
  const [notesModal, setNotesModal] = useState(null); // élève sélectionné
  const [notes, setNotes] = useState([]);
  const [noteForm, setNoteForm] = useState({ matiere: "", trimestre: "1", eval1: "", eval2: "", compo: "" });
  const [editNote, setEditNote] = useState(null); // note en cours de modification
  const [noteMoyenne, setNoteMoyenne] = useState(null);
  const [savingNote, setSavingNote] = useState(false);
  const [bulletinModal, setBulletinModal] = useState(null); // données du bulletin
  const [bulletinTrimestre, setBulletinTrimestre] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    elevesApi.list().then(data => { if (Array.isArray(data)) setEleves(data); }).catch(() => {});
    classesApi.list().then(data => { if (Array.isArray(data)) setClassesList(data); }).catch(() => {});
  }, []);

  const filtered = eleves.filter(e => {
    const matchFilter = filter === "tous" || e.statut === filter || e.frais_statut === filter || e.frais === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || `${e.prenom} ${e.nom}`.toLowerCase().includes(q) || (e.classe_nom || "").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const openCreate = () => { setForm(EMPTY_FORM_ELEVE); setEditEleve(null); setError(""); setShowModal(true); };

  const openEdit = (row) => {
    setForm({
      prenom: "", nom: "", email: "", password: "",
      classe: row.classe ?? "",
      statut: row.statut || "actif",
      mois_payes: row.mois_payes ?? 0,
      date_naissance: row.date_naissance || "",
    });
    setEditEleve(row);
    setError("");
    setShowModal(true);
  };

  const saveEleve = async () => {
    if (editEleve) {
      if (!form.classe) { setError("La classe est obligatoire."); return; }
      setSaving(true); setError("");
      try {
        const mois = parseInt(form.mois_payes) || 0;
        const frais_statut = mois >= 11 ? "payé" : mois > 0 ? "partiel" : "impayé";
        const updated = await elevesApi.update(editEleve.id, {
          classe: parseInt(form.classe), statut: form.statut,
          mois_payes: mois, frais_statut,
        });
        if (updated?.id) {
          setEleves(prev => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e));
          setShowModal(false);
        } else { setError("Erreur lors de la mise à jour."); }
      } catch { setError("Une erreur est survenue."); }
      finally { setSaving(false); }
    } else {
      if (!form.prenom || !form.nom || !form.email || !form.classe) {
        setError("Veuillez remplir tous les champs obligatoires.");
        return;
      }
      setSaving(true); setError("");
      try {
        const autoPassword = `Eleve@${form.nom.charAt(0).toUpperCase()}${form.prenom.charAt(0).toUpperCase()}${new Date().getFullYear()}`;
        const newUser = await usersApi.create({
          first_name: form.prenom, last_name: form.nom,
          email: form.email, password: autoPassword,
          role: "eleve", is_active: true,
        });
        if (!newUser?.id) { setError("Erreur lors de la création du compte."); setSaving(false); return; }
        const mois = parseInt(form.mois_payes) || 0;
        const frais_statut = mois >= 11 ? "payé" : mois > 0 ? "partiel" : "impayé";
        const payload = { user: newUser.id, classe: parseInt(form.classe), statut: form.statut, mois_payes: mois, frais_statut };
        if (form.date_naissance) payload.date_naissance = form.date_naissance;
        const eleve = await elevesApi.create(payload);
        if (eleve?.id) {
          setEleves(prev => [...prev, eleve]);
          setShowModal(false);
        } else { setError("Erreur lors de la création du profil élève."); }
      } catch { setError("Une erreur est survenue."); }
      finally { setSaving(false); }
    }
  };

  const deleteEleve = async (row) => {
    const nom = `${row.prenom || ""} ${row.nom || ""}`.trim() || "cet élève";
    if (!window.confirm(`Supprimer ${nom} ? Cette action est irréversible.`)) return;
    await elevesApi.delete(row.id);
    setEleves(prev => prev.filter(e => e.id !== row.id));
  };

  const openNotes = async (row) => {
    setNotesModal(row);
    setNoteForm({ matiere: "", trimestre: "1", eval1: "", eval2: "", compo: "" });
    const data = await elevesApi.notes(row.id);
    setNotes(Array.isArray(data) ? data : []);
    const detail = await elevesApi.get(row.id);
    setNoteMoyenne(detail?.moyenne ?? null);
  };

  const submitNote = async () => {
    if (!noteForm.matiere) return;
    const entries = [
      { valeur: noteForm.eval1, commentaire: "Évaluation n° 1" },
      { valeur: noteForm.eval2, commentaire: "Évaluation n° 2" },
      { valeur: noteForm.compo, commentaire: "Composition" },
    ].filter(e => e.valeur !== "" && e.valeur !== undefined);
    if (entries.length === 0) return;
    setSavingNote(true);
    const newNotes = [];
    for (const entry of entries) {
      const note = await elevesApi.addNote(notesModal.id, {
        matiere: noteForm.matiere,
        valeur: parseFloat(entry.valeur),
        trimestre: parseInt(noteForm.trimestre),
        commentaire: entry.commentaire,
      });
      if (note?.id) newNotes.push(note);
    }
    if (newNotes.length > 0) {
      setNotes(prev => [...newNotes, ...prev]);
      setNoteForm({ matiere: "", trimestre: "1", eval1: "", eval2: "", compo: "" });
      const detail = await elevesApi.get(notesModal.id);
      const newMoyenne = detail?.moyenne ?? null;
      setNoteMoyenne(newMoyenne);
      setEleves(prev => prev.map(e => e.id === notesModal.id ? { ...e, moyenne: newMoyenne } : e));
    }
    setSavingNote(false);
  };

  const removeNote = async (noteId) => {
    await elevesApi.deleteNote(noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
    const detail = await elevesApi.get(notesModal.id);
    const newMoyenne = detail?.moyenne ?? null;
    setNoteMoyenne(newMoyenne);
    setEleves(prev => prev.map(e => e.id === notesModal.id ? { ...e, moyenne: newMoyenne } : e));
  };

  const startEditNote = (n) => setEditNote({ id: n.id, valeur: String(n.valeur), commentaire: n.commentaire || "" });

  const updateNote = async () => {
    if (!editNote?.valeur) return;
    setSavingNote(true);
    await elevesApi.updateNote(editNote.id, {
      valeur: parseFloat(editNote.valeur),
      commentaire: editNote.commentaire,
    });
    const [notesList, detail] = await Promise.all([
      elevesApi.notes(notesModal.id),
      elevesApi.get(notesModal.id),
    ]);
    if (Array.isArray(notesList)) setNotes(notesList);
    const newMoyenne = detail?.moyenne ?? null;
    setNoteMoyenne(newMoyenne);
    setEleves(prev => prev.map(e => e.id === notesModal.id ? { ...e, moyenne: newMoyenne } : e));
    setEditNote(null);
    setSavingNote(false);
  };

  const ouvrirBulletin = async (trimestre = "") => {
    const data = await elevesApi.bulletin(notesModal.id, trimestre || undefined);
    if (data) setBulletinModal(data);
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });
  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box" };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: COLORS.muted, marginBottom: 6, display: "block" };

  const columns = [
    { key: "nom", label: "Élève", render: (v, row) => <span style={{ fontWeight: 600 }}>{row.prenom} {row.nom}</span> },
    { key: "classe_nom", label: "Classe", render: (v, row) => v || row.classe || "—" },
    { key: "moyenne", label: "Moyenne", render: v => v ? <span style={{ fontWeight: 700, color: v >= 14 ? COLORS.success : v >= 10 ? COLORS.warning : COLORS.danger }}>{parseFloat(v).toFixed(1)}/20</span> : "—" },
    { key: "statut", label: "Statut", render: v => <Badge label={v} /> },
    ...(isAdmin ? [{
      key: "mois_payes", label: "Paiement",
      render: (v, row) => {
        const mois = row.mois_payes ?? (row.frais === "payé" ? 11 : row.frais === "partiel" ? 5 : 0);
        const total = 11;
        const pct = Math.round((mois / total) * 100);
        const color = mois >= 11 ? COLORS.success : mois >= 6 ? COLORS.warning : mois > 0 ? "#F97316" : COLORS.danger;
        return (
          <div style={{ minWidth: 120 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color }}>{mois}/11 mois</span>
              <span style={{ fontSize: 11, color: COLORS.muted }}>{pct}%</span>
            </div>
            <div style={{ height: 7, borderRadius: 10, background: `${COLORS.border}`, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, borderRadius: 10, background: color, transition: "width 0.4s ease" }} />
            </div>
          </div>
        );
      }
    }] : []),
    {
      key: "actions", label: "Actions",
      render: (_, row) => (
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn" onClick={() => openNotes(row)}
            style={{ background: `${COLORS.success}15`, padding: "6px 10px", borderRadius: 7, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: COLORS.success }}>
            <Icon name="award" size={13} color={COLORS.success} /> Notes
          </button>
          {isAdmin && <>
            <button className="btn" onClick={() => openEdit(row)}
              style={{ background: `${COLORS.secondary}15`, padding: "6px 10px", borderRadius: 7, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: COLORS.secondary }}>
              <Icon name="edit" size={13} color={COLORS.secondary} /> Modifier
            </button>
            <button className="btn" onClick={() => deleteEleve(row)}
              style={{ background: `${COLORS.danger}15`, padding: "6px 10px", borderRadius: 7, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: COLORS.danger }}>
              <Icon name="trash" size={13} color={COLORS.danger} /> Supprimer
            </button>
          </>}
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader title="Gestion des Élèves" subtitle={`${eleves.length} élèves au total`}
        action={isAdmin && <button className="btn" onClick={openCreate} style={{ background: COLORS.secondary, color: "#fff", padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="plus" size={16} color="#fff" /> Nouvel élève
        </button>} />

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {[["tous", "Tous"], ["actif", "Actifs"], ["suspendu", "Suspendus"], ...(isAdmin ? [["impayé", "Impayés"]] : [])].map(([val, label]) => (
          <button key={val} className="btn" onClick={() => setFilter(val)} style={{
            padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 500,
            background: filter === val ? COLORS.primary : "#fff",
            color: filter === val ? "#fff" : COLORS.muted,
            border: `1px solid ${filter === val ? COLORS.primary : COLORS.border}`
          }}>{label}</button>
        ))}
        <div style={{ position: "relative", marginLeft: "auto", display: "flex", alignItems: "center" }}>
          <span style={{ position: "absolute", left: 10, pointerEvents: "none", display: "flex", alignItems: "center" }}>
            <Icon name="search" size={14} color={COLORS.muted} />
          </span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un élève..."
            style={{
              paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
              borderRadius: 20, border: `1.5px solid ${COLORS.border}`, fontSize: 13,
              fontFamily: "'DM Sans',sans-serif", outline: "none", width: 210,
            }} />
        </div>
      </div>
      <DataTable columns={columns} data={filtered} isMobile={isMobile} />

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 500, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: COLORS.text }}>
                {editEleve ? "Modifier l'élève" : "Nouvel élève"}
              </h3>
              <button className="btn" onClick={() => setShowModal(false)} style={{ background: COLORS.bg, padding: 6, borderRadius: 8 }}>
                <Icon name="x" size={16} color={COLORS.muted} />
              </button>
            </div>

            {!editEleve && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div><label style={labelStyle}>Prénom *</label><input style={inputStyle} placeholder="Aminata" {...f("prenom")} /></div>
                  <div><label style={labelStyle}>Nom *</label><input style={inputStyle} placeholder="Diallo" {...f("nom")} /></div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Email *</label>
                  <input style={inputStyle} type="email" placeholder="a.diallo@eleve.sn" {...f("email")} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Date de naissance</label>
                  <input style={inputStyle} type="date" {...f("date_naissance")} />
                </div>
              </>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Classe *</label>
              <select style={inputStyle} {...f("classe")}>
                <option value="">— Choisir une classe —</option>
                {classesList.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Statut</label>
              <select style={inputStyle} {...f("statut")}>
                <option value="actif">Actif</option>
                <option value="suspendu">Suspendu</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>

            {error && <div style={{ color: COLORS.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn" onClick={() => setShowModal(false)} style={{ flex: 1, padding: 12, background: COLORS.bg, color: COLORS.muted, borderRadius: 10, fontWeight: 600, fontSize: 14 }}>Annuler</button>
              <button className="btn" onClick={saveEleve} disabled={saving} style={{ flex: 2, padding: 12, background: `linear-gradient(135deg,${COLORS.secondary},${COLORS.primary})`, color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14, opacity: saving ? 0.7 : 1 }}>
                {saving ? "Enregistrement..." : editEleve ? "Mettre à jour" : "Créer l'élève"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Notes */}
      {notesModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 560, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: COLORS.text }}>
                Notes — {notesModal.prenom} {notesModal.nom}
              </h3>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select value={bulletinTrimestre} onChange={e => setBulletinTrimestre(e.target.value)}
                  style={{ padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`, fontSize: 12, color: COLORS.muted, background: COLORS.bg }}>
                  <option value="">Tous trimestres</option>
                  <option value="1">Trimestre 1</option>
                  <option value="2">Trimestre 2</option>
                  <option value="3">Trimestre 3</option>
                </select>
                <button onClick={() => ouvrirBulletin(bulletinTrimestre)} className="btn"
                  style={{ background: COLORS.primary, color: "#fff", padding: "7px 14px", borderRadius: 8, fontWeight: 600, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="reports" size={13} color="#fff" /> Bulletin
                </button>
                <button className="btn" onClick={() => setNotesModal(null)} style={{ background: COLORS.bg, padding: 6, borderRadius: 8 }}>
                  <Icon name="x" size={16} color={COLORS.muted} />
                </button>
              </div>
            </div>

            {/* Moyenne */}
            <div style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 12, background: noteMoyenne >= 10 ? `${COLORS.success}12` : `${COLORS.danger}12`, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, color: COLORS.muted, fontWeight: 500 }}>Moyenne générale</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: noteMoyenne >= 14 ? COLORS.success : noteMoyenne >= 10 ? COLORS.warning : noteMoyenne !== null ? COLORS.danger : COLORS.muted }}>
                {noteMoyenne !== null ? `${parseFloat(noteMoyenne).toFixed(2)}/20` : "—"}
              </span>
            </div>

            {/* Formulaire ajout note */}
            <div style={{ background: COLORS.bg, borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>Ajouter une note</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={labelStyle}>Matière *</label>
                  <select style={inputStyle} value={noteForm.matiere} onChange={e => setNoteForm(p => ({ ...p, matiere: e.target.value }))}>
                    <option value="">— Choisir —</option>
                    {MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Trimestre</label>
                  <select style={inputStyle} value={noteForm.trimestre} onChange={e => setNoteForm(p => ({ ...p, trimestre: e.target.value }))}>
                    <option value="1">Trimestre 1</option>
                    <option value="2">Trimestre 2</option>
                    <option value="3">Trimestre 3</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Évaluation n° 1 /20</label>
                  <input style={inputStyle} type="number" min="0" max="20" step="0.25" placeholder="—"
                    value={noteForm.eval1} onChange={e => setNoteForm(p => ({ ...p, eval1: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Évaluation n° 2 /20</label>
                  <input style={inputStyle} type="number" min="0" max="20" step="0.25" placeholder="—"
                    value={noteForm.eval2} onChange={e => setNoteForm(p => ({ ...p, eval2: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Composition /20</label>
                  <input style={inputStyle} type="number" min="0" max="20" step="0.25" placeholder="—"
                    value={noteForm.compo} onChange={e => setNoteForm(p => ({ ...p, compo: e.target.value }))} />
                </div>
              </div>
              <button className="btn" onClick={submitNote} disabled={savingNote || !noteForm.matiere || (!noteForm.eval1 && !noteForm.eval2 && !noteForm.compo)}
                style={{ width: "100%", padding: "10px", background: `linear-gradient(135deg,${COLORS.secondary},${COLORS.primary})`, color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14, opacity: (savingNote || !noteForm.matiere || (!noteForm.eval1 && !noteForm.eval2 && !noteForm.compo)) ? 0.5 : 1 }}>
                {savingNote ? "Enregistrement..." : "Ajouter les notes"}
              </button>
            </div>

            {/* Liste des notes */}
            {notes.length === 0
              ? <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: 16 }}>Aucune note enregistrée.</p>
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {notes.map(n => {
                    const c = n.valeur >= 14 ? COLORS.success : n.valeur >= 10 ? COLORS.warning : COLORS.danger;
                    const isEditing = editNote?.id === n.id;
                    return (
                      <div key={n.id} style={{ background: "#fff", border: `1px solid ${isEditing ? COLORS.secondary : COLORS.border}`, borderRadius: 10, padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontWeight: 700, fontSize: 16, color: c, minWidth: 52 }}>{parseFloat(n.valeur).toFixed(2)}/20</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{n.matiere}</div>
                            <div style={{ fontSize: 11, color: COLORS.muted }}>T{n.trimestre} {n.commentaire ? `— ${n.commentaire}` : ""}</div>
                          </div>
                          <button className="btn" onClick={() => isEditing ? setEditNote(null) : startEditNote(n)}
                            style={{ background: `${COLORS.secondary}15`, padding: "5px 8px", borderRadius: 7, display: "flex", alignItems: "center" }}>
                            <Icon name={isEditing ? "x" : "edit"} size={13} color={COLORS.secondary} />
                          </button>
                          <button className="btn" onClick={() => removeNote(n.id)}
                            style={{ background: `${COLORS.danger}15`, padding: "5px 8px", borderRadius: 7, display: "flex", alignItems: "center" }}>
                            <Icon name="trash" size={13} color={COLORS.danger} />
                          </button>
                        </div>
                        {isEditing && (
                          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${COLORS.border}` }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, marginBottom: 6, display: "block" }}>Nouvelle note /20</label>
                            <div style={{ display: "flex", gap: 8 }}>
                              <input style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.secondary}`, fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none" }}
                                type="number" min="0" max="20" step="0.25" autoFocus
                                value={editNote.valeur} onChange={e => setEditNote(p => ({ ...p, valeur: e.target.value }))} />
                              <button className="btn" onClick={updateNote} disabled={savingNote}
                                style={{ padding: "8px 18px", background: `linear-gradient(135deg,${COLORS.secondary},${COLORS.primary})`, color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", opacity: savingNote ? 0.7 : 1 }}>
                                {savingNote ? "..." : "Enregistrer"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>
        </div>
      )}

      {/* Modal Bulletin */}
      {bulletinModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20, overflowY: "auto" }}>
          <div id="bulletin-print" style={{ background: "#fff", borderRadius: 20, padding: 36, width: "100%", maxWidth: 640, boxShadow: "0 24px 80px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
            {/* En-tête bulletin */}
            <div style={{ textAlign: "center", marginBottom: 24, paddingBottom: 20, borderBottom: `2px solid ${COLORS.primary}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>République du Sénégal</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.primary, fontFamily: "'Playfair Display', serif" }}>Bulletin de Notes</div>
              {bulletinModal.trimestre && (
                <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>Trimestre {bulletinModal.trimestre}</div>
              )}
            </div>

            {/* Infos élève */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24, background: COLORS.bg, borderRadius: 12, padding: 16 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", marginBottom: 3 }}>Élève</div>
                <div style={{ fontWeight: 700, color: COLORS.text }}>{bulletinModal.eleve.prenom} {bulletinModal.eleve.nom}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", marginBottom: 3 }}>Classe</div>
                <div style={{ fontWeight: 600 }}>{bulletinModal.eleve.classe || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", marginBottom: 3 }}>Rang</div>
                <div style={{ fontWeight: 700, color: COLORS.primary }}>
                  {bulletinModal.rang ? `${bulletinModal.rang}${bulletinModal.rang === 1 ? "er" : "ème"} / ${bulletinModal.total_eleves_classe}` : "—"}
                </div>
              </div>
            </div>

            {/* Tableau matières */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
              <thead>
                <tr style={{ background: COLORS.primary }}>
                  <th style={{ padding: "10px 14px", textAlign: "left", color: "#fff", fontSize: 12, fontWeight: 700 }}>Matière</th>
                  <th style={{ padding: "10px 14px", textAlign: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>Notes</th>
                  <th style={{ padding: "10px 14px", textAlign: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>Moyenne</th>
                  <th style={{ padding: "10px 14px", textAlign: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>Appréciation</th>
                </tr>
              </thead>
              <tbody>
                {bulletinModal.matieres.map((m, i) => {
                  const moy = m.moyenne;
                  const apprec = moy >= 16 ? "Très bien" : moy >= 14 ? "Bien" : moy >= 12 ? "Assez bien" : moy >= 10 ? "Passable" : "Insuffisant";
                  const color = moy >= 14 ? COLORS.success : moy >= 10 ? COLORS.warning : COLORS.danger;
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}`, background: i % 2 === 0 ? "#fff" : COLORS.bg }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600, fontSize: 13 }}>{m.matiere}</td>
                      <td style={{ padding: "10px 14px", textAlign: "center", fontSize: 12, color: COLORS.muted }}>
                        {m.notes.map(n => `${n.valeur}${n.commentaire ? ` (${n.commentaire})` : ""}`).join(" · ")}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 800, fontSize: 15, color }}>{moy.toFixed(2)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "center", fontSize: 12, color }}>{apprec}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: COLORS.primary }}>
                  <td colSpan={2} style={{ padding: "12px 14px", color: "#fff", fontWeight: 700, fontSize: 14 }}>Moyenne Générale</td>
                  <td style={{ padding: "12px 14px", textAlign: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>
                    {bulletinModal.moyenne_generale !== null ? `${parseFloat(bulletinModal.moyenne_generale).toFixed(2)}/20` : "—"}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center", color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                    {bulletinModal.moyenne_generale >= 16 ? "Félicitations" : bulletinModal.moyenne_generale >= 14 ? "Encouragements" : bulletinModal.moyenne_generale >= 10 ? "Passable" : "Avertissement"}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Absences */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, background: `${COLORS.warning}15`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase" }}>Absences totales</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.warning, marginTop: 2 }}>{bulletinModal.absences_total}</div>
              </div>
              <div style={{ flex: 1, background: `${COLORS.success}15`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase" }}>Justifiées</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.success, marginTop: 2 }}>{bulletinModal.absences_justifiees}</div>
              </div>
              <div style={{ flex: 1, background: `${COLORS.danger}15`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase" }}>Non justifiées</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.danger, marginTop: 2 }}>{bulletinModal.absences_total - bulletinModal.absences_justifiees}</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setBulletinModal(null)} style={{ flex: 1, padding: "11px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, background: "#fff", color: COLORS.muted, fontWeight: 600, cursor: "pointer" }}>Fermer</button>
              <button onClick={() => window.print()} style={{ flex: 1, padding: "11px", border: "none", borderRadius: 10, background: COLORS.primary, color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon name="reports" size={16} color="#fff" /> Télécharger PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const MATIERES = [
  "Mathématiques", "Physique-Chimie", "Sciences de la Vie et de la Terre",
  "Français", "Anglais", "Espagnol", "Arabe", "Portugais",
  "Histoire-Géographie", "Philosophie", "Économie & Gestion",
  "Informatique", "Éducation Physique et Sportive", "Arts Plastiques",
  "Musique", "Comptabilité", "Technologie",
];

const EMPTY_FORM_ENSEIGNANT = { prenom: "", nom: "", email: "", password: "", matiere: "", contrat: "vacataire", heures_semaine: "", classes: [] };

function Enseignants({ isMobile }) {
  const [liste, setListe] = useState(mockData.enseignants);
  const [classesList, setClassesList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editEnseignant, setEditEnseignant] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM_ENSEIGNANT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    enseignantsApi.list().then(data => { if (Array.isArray(data)) setListe(data); }).catch(() => {});
    classesApi.list().then(data => { if (Array.isArray(data)) setClassesList(data); }).catch(() => {});
  }, []);

  const openCreate = () => { setForm(EMPTY_FORM_ENSEIGNANT); setEditEnseignant(null); setError(""); setShowModal(true); };

  const openEdit = (row) => {
    setForm({
      prenom: "", nom: "", email: "", password: "",
      matiere: row.matiere || "",
      contrat: row.contrat || "vacataire",
      heures_semaine: row.heures_semaine ?? "",
      classes: row.classes || [],
    });
    setEditEnseignant(row);
    setError("");
    setShowModal(true);
  };

  const toggleClasse = (id) => {
    setForm(p => ({
      ...p,
      classes: p.classes.includes(id) ? p.classes.filter(c => c !== id) : [...p.classes, id],
    }));
  };

  const saveEnseignant = async () => {
    if (editEnseignant) {
      if (!form.matiere) { setError("La matière est obligatoire."); return; }
      setSaving(true); setError("");
      try {
        const updated = await enseignantsApi.update(editEnseignant.id, {
          matiere: form.matiere, contrat: form.contrat,
          heures_semaine: parseInt(form.heures_semaine) || 0,
          classes: form.classes,
        });
        if (updated?.id) {
          setListe(prev => prev.map(e => e.id === updated.id ? updated : e));
          setShowModal(false);
        } else { setError("Erreur lors de la mise à jour."); }
      } catch { setError("Une erreur est survenue."); }
      finally { setSaving(false); }
    } else {
      if (!form.prenom || !form.nom || !form.email || !form.password || !form.matiere) {
        setError("Veuillez remplir tous les champs obligatoires.");
        return;
      }
      setSaving(true); setError("");
      try {
        const newUser = await usersApi.create({
          first_name: form.prenom, last_name: form.nom,
          email: form.email, password: form.password,
          role: "enseignant", is_active: true,
        });
        if (!newUser?.id) { setError("Erreur lors de la création du compte."); setSaving(false); return; }
        const prof = await enseignantsApi.create({
          user: newUser.id, matiere: form.matiere,
          contrat: form.contrat, heures_semaine: parseInt(form.heures_semaine) || 0,
          classes: form.classes,
        });
        if (prof?.id) {
          setListe(prev => [...prev, prof]);
          setShowModal(false);
        } else { setError("Erreur lors de la création du profil enseignant."); }
      } catch { setError("Une erreur est survenue."); }
      finally { setSaving(false); }
    }
  };

  const deleteEnseignant = async (row) => {
    if (!window.confirm(`Supprimer ${row.nom_complet || "cet enseignant"} ? Cette action est irréversible.`)) return;
    await enseignantsApi.delete(row.id);
    setListe(prev => prev.filter(e => e.id !== row.id));
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });
  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box" };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: COLORS.muted, marginBottom: 6, display: "block" };

  const columns = [
    { key: "nom", label: "Enseignant", render: (v, row) => <span style={{ fontWeight: 600 }}>{row.nom_complet || v}</span> },
    { key: "matiere", label: "Matière" },
    {
      key: "classes_noms", label: "Classes",
      render: (v, row) => {
        const noms = row.classes_noms || [];
        if (noms.length === 0) return <span style={{ color: COLORS.muted, fontSize: 13 }}>—</span>;
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {noms.map(n => (
              <span key={n} style={{ fontSize: 11, background: `${COLORS.secondary}15`, color: COLORS.secondary, padding: "2px 7px", borderRadius: 6, fontWeight: 500 }}>{n}</span>
            ))}
          </div>
        );
      }
    },
    { key: "heures", label: "H/sem.", render: (v, row) => <span>{row.heures_semaine ?? v}h</span> },
    { key: "contrat", label: "Contrat", render: v => <Badge label={v} /> },
    {
      key: "actions", label: "Actions",
      render: (_, row) => (
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn" onClick={() => openEdit(row)}
            style={{ background: `${COLORS.secondary}15`, padding: "6px 10px", borderRadius: 7, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: COLORS.secondary }}>
            <Icon name="edit" size={13} color={COLORS.secondary} /> Modifier
          </button>
          <button className="btn" onClick={() => deleteEnseignant(row)}
            style={{ background: `${COLORS.danger}15`, padding: "6px 10px", borderRadius: 7, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: COLORS.danger }}>
            <Icon name="trash" size={13} color={COLORS.danger} /> Supprimer
          </button>
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader title="Enseignants" subtitle={`${liste.length} enseignants enregistrés`}
        action={<button className="btn" onClick={openCreate} style={{ background: COLORS.secondary, color: "#fff", padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="plus" size={16} color="#fff" /> Ajouter
        </button>} />
      <DataTable columns={columns} data={liste} isMobile={isMobile} />

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 500, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: COLORS.text }}>
                {editEnseignant ? "Modifier l'enseignant" : "Nouvel enseignant"}
              </h3>
              <button className="btn" onClick={() => setShowModal(false)} style={{ background: COLORS.bg, padding: 6, borderRadius: 8 }}>
                <Icon name="x" size={16} color={COLORS.muted} />
              </button>
            </div>

            {!editEnseignant && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div><label style={labelStyle}>Prénom *</label><input style={inputStyle} placeholder="Aminata" {...f("prenom")} /></div>
                  <div><label style={labelStyle}>Nom *</label><input style={inputStyle} placeholder="Diallo" {...f("nom")} /></div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Email *</label>
                  <input style={inputStyle} type="email" placeholder="a.diallo@geschool.sn" {...f("email")} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Mot de passe *</label>
                  <input style={inputStyle} type="password" placeholder="Min. 8 caractères" {...f("password")} />
                </div>
              </>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Matière *</label>
              <select style={inputStyle} {...f("matiere")}>
                <option value="">— Choisir une matière —</option>
                {MATIERES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Contrat</label>
                <select style={inputStyle} {...f("contrat")}>
                  <option value="vacataire">Vacataire</option>
                  <option value="titulaire">Titulaire</option>
                </select>
              </div>
              <div><label style={labelStyle}>Heures / semaine</label><input style={inputStyle} type="number" min="0" placeholder="18" {...f("heures_semaine")} /></div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Classes assignées</label>
              {classesList.length === 0
                ? <p style={{ fontSize: 13, color: COLORS.muted }}>Aucune classe disponible.</p>
                : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: COLORS.bg, borderRadius: 10, padding: 12 }}>
                    {classesList.map(c => {
                      const checked = form.classes.includes(c.id);
                      return (
                        <label key={c.id} onClick={() => toggleClasse(c.id)}
                          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 8px", borderRadius: 8, background: checked ? `${COLORS.secondary}18` : "transparent", transition: "background 0.15s" }}>
                          <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked ? COLORS.secondary : COLORS.border}`, background: checked ? COLORS.secondary : "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: checked ? 600 : 400, color: checked ? COLORS.secondary : COLORS.text }}>{c.nom}</span>
                        </label>
                      );
                    })}
                  </div>
                )
              }
            </div>

            {error && <div style={{ color: COLORS.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn" onClick={() => setShowModal(false)} style={{ flex: 1, padding: 12, background: COLORS.bg, color: COLORS.muted, borderRadius: 10, fontWeight: 600, fontSize: 14 }}>Annuler</button>
              <button className="btn" onClick={saveEnseignant} disabled={saving} style={{ flex: 2, padding: 12, background: `linear-gradient(135deg,${COLORS.secondary},${COLORS.primary})`, color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14, opacity: saving ? 0.7 : 1 }}>
                {saving ? "Enregistrement..." : editEnseignant ? "Mettre à jour" : "Créer l'enseignant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Classes({ isMobile, currentUser }) {
  const [liste, setListe] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editClasse, setEditClasse] = useState(null);
  const [form, setForm] = useState({ nom: "", salle: "", effectif_max: "45" });
  const [elevesModal, setElevesModal] = useState(null);
  const isAdmin = currentUser?.role === "admin";
  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", boxSizing: "border-box" };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: COLORS.muted, marginBottom: 6, display: "block" };

  useEffect(() => {
    classesApi.list().then(data => { if (Array.isArray(data)) setListe(data); }).catch(() => {});
  }, []);

  const openCreate = () => { setForm({ nom: "", salle: "", effectif_max: "45" }); setEditClasse(null); setShowModal(true); };
  const openEdit = (c) => { setForm({ nom: c.nom, salle: c.salle || "", effectif_max: String(c.effectif_max || 45) }); setEditClasse(c); setShowModal(true); };

  const save = async () => {
    if (!form.nom) return;
    const payload = { nom: form.nom, salle: form.salle, effectif_max: parseInt(form.effectif_max) || 45 };
    if (editClasse) {
      const updated = await classesApi.update(editClasse.id, payload);
      if (updated?.id) setListe(prev => prev.map(c => c.id === editClasse.id ? updated : c));
    } else {
      const created = await classesApi.create(payload);
      if (created?.id) setListe(prev => [...prev, created]);
    }
    setShowModal(false);
  };

  const deleteClasse = async (id) => {
    if (!window.confirm("Supprimer cette classe ? Les élèves ne seront pas supprimés.")) return;
    await classesApi.delete(id);
    setListe(prev => prev.filter(c => c.id !== id));
  };

  const viewEleves = async (classe) => {
    const data = await elevesApi.list();
    const eleves = Array.isArray(data) ? data.filter(e => e.classe === classe.id) : [];
    setElevesModal({ classe, eleves });
  };

  const columns = [
    { key: "nom", label: "Classe", render: v => <span style={{ fontWeight: 700, color: COLORS.primary }}>{v}</span> },
    { key: "effectif", label: "Effectif", render: (v, row) => <span style={{ fontWeight: 600 }}>{v ?? 0}<span style={{ color: COLORS.muted, fontWeight: 400 }}>/{row.effectif_max ?? 45}</span></span> },
    { key: "salle", label: "Salle", render: v => v || "—" },
    { key: "emploi_statut", label: "Emploi du temps", render: v => <Badge label={v || "Partiel"} /> },
    {
      key: "actions", label: "Actions",
      render: (_, row) => (
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn" onClick={() => viewEleves(row)}
            style={{ background: `${COLORS.secondary}15`, padding: "6px 10px", borderRadius: 7, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: COLORS.secondary }}>
            <Icon name="students" size={13} color={COLORS.secondary} /> Élèves
          </button>
          {isAdmin && <>
            <button className="btn" onClick={() => openEdit(row)}
              style={{ background: `${COLORS.secondary}15`, padding: "6px 10px", borderRadius: 7, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: COLORS.secondary }}>
              <Icon name="edit" size={13} color={COLORS.secondary} /> Modifier
            </button>
            <button className="btn" onClick={() => deleteClasse(row.id)}
              style={{ background: `${COLORS.danger}15`, padding: "6px 10px", borderRadius: 7, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: COLORS.danger }}>
              <Icon name="trash" size={13} color={COLORS.danger} /> Supprimer
            </button>
          </>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Classes" subtitle={`${liste.length} classes actives`}
        action={isAdmin && (
          <button className="btn" onClick={openCreate} style={{ background: COLORS.secondary, color: "#fff", padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="plus" size={16} color="#fff" /> Nouvelle classe
          </button>
        )} />
      <DataTable columns={columns} data={liste} isMobile={isMobile} />

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 420, boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: COLORS.text }}>{editClasse ? "Modifier la classe" : "Nouvelle classe"}</h3>
              <button className="btn" onClick={() => setShowModal(false)} style={{ background: COLORS.bg, padding: 6, borderRadius: 8 }}><Icon name="x" size={16} color={COLORS.muted} /></button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nom de la classe *</label>
              <input style={inputStyle} placeholder="ex: Terminale S1" value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Salle</label>
                <input style={inputStyle} placeholder="ex: A101" value={form.salle} onChange={e => setForm(p => ({ ...p, salle: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Effectif max</label>
                <input style={inputStyle} type="number" min="1" max="100" value={form.effectif_max} onChange={e => setForm(p => ({ ...p, effectif_max: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button className="btn" onClick={() => setShowModal(false)} style={{ flex: 1, padding: 12, background: COLORS.bg, color: COLORS.muted, borderRadius: 10, fontWeight: 600, fontSize: 14 }}>Annuler</button>
              <button className="btn" onClick={save} style={{ flex: 2, padding: 12, background: `linear-gradient(135deg,${COLORS.secondary},${COLORS.primary})`, color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>{editClasse ? "Mettre à jour" : "Créer la classe"}</button>
            </div>
          </div>
        </div>
      )}

      {elevesModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 500, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: COLORS.text }}>Élèves — {elevesModal.classe.nom}</h3>
              <button className="btn" onClick={() => setElevesModal(null)} style={{ background: COLORS.bg, padding: 6, borderRadius: 8 }}><Icon name="x" size={16} color={COLORS.muted} /></button>
            </div>
            <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 16 }}>{elevesModal.eleves.length} élève(s) inscrit(s)</div>
            {elevesModal.eleves.length === 0
              ? <p style={{ textAlign: "center", color: COLORS.muted, padding: 20 }}>Aucun élève dans cette classe.</p>
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {elevesModal.eleves.map((e, i) => (
                    <div key={e.id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: COLORS.bg, borderRadius: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${COLORS.secondary},${COLORS.primary})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {(e.prenom || "?")[0]}{(e.nom || "?")[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{e.prenom} {e.nom}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>{e.statut}{e.moyenne ? ` — Moy: ${parseFloat(e.moyenne).toFixed(1)}/20` : ""}</div>
                      </div>
                      <Badge label={e.statut} />
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      )}
    </div>
  );
}

function Finances({ isMobile, currentUser }) {
  const [liste, setListe] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterType, setFilterType] = useState("tous");
  const [filterStatut, setFilterStatut] = useState("tous");
  const [form, setForm] = useState({ type: "recette", libelle: "", montant: "", date: new Date().toISOString().split("T")[0], statut: "en attente" });
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "comptable";

  useEffect(() => {
    financesApi.list().then(data => { if (Array.isArray(data)) setListe(data); }).catch(() => {});
  }, []);

  const recettes = liste.filter(f => f.type === "recette").reduce((s, f) => s + parseFloat(f.montant || 0), 0);
  const depenses = liste.filter(f => f.type === "depense").reduce((s, f) => s + parseFloat(f.montant || 0), 0);

  const filtered = liste.filter(f => {
    if (filterType !== "tous" && f.type !== filterType) return false;
    if (filterStatut !== "tous" && f.statut !== filterStatut) return false;
    return true;
  });

  const openCreate = () => {
    setEditItem(null);
    setForm({ type: "recette", libelle: "", montant: "", date: new Date().toISOString().split("T")[0], statut: "en attente" });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ type: item.type, libelle: item.libelle, montant: String(item.montant), date: item.date, statut: item.statut });
    setShowModal(true);
  };

  const save = async () => {
    const payload = { ...form, montant: parseFloat(form.montant) };
    if (editItem) {
      const updated = await financesApi.update(editItem.id, payload);
      if (updated?.id) setListe(prev => prev.map(f => f.id === editItem.id ? updated : f));
    } else {
      const created = await financesApi.create(payload);
      if (created?.id) setListe(prev => [created, ...prev]);
    }
    setShowModal(false);
  };

  const deleteFinance = async (id) => {
    if (!window.confirm("Supprimer cette transaction ?")) return;
    await financesApi.delete(id);
    setListe(prev => prev.filter(f => f.id !== id));
  };

  const exportCSV = () => {
    const headers = ["ID", "Type", "Libellé", "Montant", "Date", "Statut"];
    const rows = filtered.map(f => [f.id, f.type, `"${f.libelle}"`, f.montant, f.date, f.statut]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "transactions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader title="Gestion Financière" subtitle="Vue d'ensemble des flux financiers"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={exportCSV} style={{ background: "#fff", color: COLORS.primary, border: `1.5px solid ${COLORS.border}`, padding: "10px 16px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              ↓ Export CSV
            </button>
            {isAdmin && (
              <button onClick={openCreate} className="btn" style={{ background: COLORS.success, color: "#fff", padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="plus" size={16} color="#fff" /> Nouvelle transaction
              </button>
            )}
          </div>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Recettes totales</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.success, marginTop: 6 }}>{recettes.toLocaleString()} FCFA</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Dépenses totales</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.danger, marginTop: 6 }}>{depenses.toLocaleString()} FCFA</div>
        </div>
        <div style={{ background: COLORS.primary, borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Solde net</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginTop: 6 }}>{(recettes - depenses).toLocaleString()} FCFA</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["tous", "recette", "depense"].map(f => (
          <button key={f} onClick={() => setFilterType(f)} style={{ padding: "7px 16px", borderRadius: 20, fontWeight: 600, fontSize: 12, cursor: "pointer", border: "none", background: filterType === f ? COLORS.secondary : COLORS.bg, color: filterType === f ? "#fff" : COLORS.muted }}>
            {f === "tous" ? "Tous" : f === "recette" ? "Recettes" : "Dépenses"}
          </button>
        ))}
        <div style={{ width: 1, background: COLORS.border, margin: "0 4px" }} />
        {["tous", "encaissé", "payé", "partiel", "en attente"].map(s => (
          <button key={s} onClick={() => setFilterStatut(s)} style={{ padding: "7px 16px", borderRadius: 20, fontWeight: 600, fontSize: 12, cursor: "pointer", border: "none", background: filterStatut === s ? COLORS.primary : COLORS.bg, color: filterStatut === s ? "#fff" : COLORS.muted }}>
            {s === "tous" ? "Tous statuts" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "auto", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr style={{ background: COLORS.bg, borderBottom: `2px solid ${COLORS.border}` }}>
              {["Type", "Libellé", "Montant", "Date", "Statut", ...(isAdmin ? ["Actions"] : [])].map(h => (
                <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} className="table-row" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: "12px 18px" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontWeight: 600, fontSize: 11, background: f.type === "recette" ? "#D1FAE5" : "#FEE2E2", color: f.type === "recette" ? "#065F46" : "#991B1B" }}>
                    {f.type === "recette" ? "Recette" : "Dépense"}
                  </span>
                </td>
                <td style={{ padding: "12px 18px", fontWeight: 500, color: COLORS.text }}>{f.libelle}</td>
                <td style={{ padding: "12px 18px", fontWeight: 700, color: f.type === "recette" ? COLORS.success : COLORS.danger }}>
                  {f.type === "recette" ? "+" : "-"}{parseFloat(f.montant).toLocaleString()} FCFA
                </td>
                <td style={{ padding: "12px 18px", color: COLORS.muted, fontSize: 13 }}>{f.date}</td>
                <td style={{ padding: "12px 18px" }}><Badge label={f.statut} /></td>
                {isAdmin && (
                  <td style={{ padding: "12px 18px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(f)} title="Modifier" style={{ border: "none", background: `${COLORS.secondary}15`, color: COLORS.secondary, borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                        <Icon name="edit" size={14} color={COLORS.secondary} />
                      </button>
                      <button onClick={() => deleteFinance(f.id)} title="Supprimer" style={{ border: "none", background: "#FEE2E2", color: COLORS.danger, borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                        <Icon name="trash" size={14} color={COLORS.danger} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={isAdmin ? 6 : 5} style={{ padding: 32, textAlign: "center", color: COLORS.muted }}>Aucune transaction</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", margin: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: 18, color: COLORS.text }}>{editItem ? "Modifier la transaction" : "Nouvelle transaction"}</h2>
              <button onClick={() => setShowModal(false)} style={{ border: "none", background: COLORS.bg, borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}><Icon name="x" size={18} /></button>
            </div>
            {[
              { label: "Type", key: "type", type: "select", options: [{ value: "recette", label: "Recette" }, { value: "depense", label: "Dépense" }] },
              { label: "Libellé", key: "libelle", type: "text", placeholder: "Description de l'opération" },
              { label: "Montant (FCFA)", key: "montant", type: "number", placeholder: "0" },
              { label: "Date", key: "date", type: "date" },
              { label: "Statut", key: "statut", type: "select", options: [
                { value: "en attente", label: "En attente" },
                { value: "encaissé", label: "Encaissé" },
                { value: "payé", label: "Payé" },
                { value: "partiel", label: "Partiel" },
              ]},
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>{field.label}</label>
                {field.type === "select" ? (
                  <select value={form[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.bg }}>
                    {field.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input type={field.type} value={form[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.bg, boxSizing: "border-box" }} />
                )}
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "11px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, background: "#fff", color: COLORS.muted, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
              <button onClick={save} style={{ flex: 1, padding: "11px", border: "none", borderRadius: 10, background: COLORS.secondary, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                {editItem ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmploiDuTemps({ isMobile, currentUser }) {
  const [slots, setSlots] = useState([]);
  const [classes, setClasses] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [filterClasse, setFilterClasse] = useState("tous");
  const [viewMode, setViewMode] = useState("grille");
  const [showModal, setShowModal] = useState(false);
  const [editSlot, setEditSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({ jour: "lundi", heure_debut: "08:00", heure_fin: "09:00", matiere: "", classe: "", enseignant: "", salle: "" });
  const isAdmin = currentUser?.role === "admin";

  const load = () => {
    emploiApi.list().then(data => { if (Array.isArray(data)) setSlots(data); }).catch(() => {});
    classesApi.list().then(data => { if (Array.isArray(data)) setClasses(data); }).catch(() => {});
    enseignantsApi.list().then(data => { if (Array.isArray(data)) setEnseignants(data); }).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const fmtTime = t => t ? t.substring(0, 5) : "";
  const fmtHeure = (debut, fin) => `${fmtTime(debut).replace(":", "h")}-${fmtTime(fin).replace(":", "h")}`;

  const days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];
  const dayLabels = { lundi: "Lundi", mardi: "Mardi", mercredi: "Mercredi", jeudi: "Jeudi", vendredi: "Vendredi" };
  const cellColors = { lundi: COLORS.secondary, mardi: COLORS.success, mercredi: "#8B5CF6", jeudi: COLORS.warning, vendredi: COLORS.danger };

  const filtered = filterClasse === "tous" ? slots : slots.filter(s => String(s.classe) === String(filterClasse));

  const heures = [...new Map(filtered.map(s => [`${s.heure_debut}_${s.heure_fin}`, { debut: s.heure_debut, fin: s.heure_fin }])).values()]
    .sort((a, b) => a.debut.localeCompare(b.debut));

  const slotMap = {};
  filtered.forEach(s => { slotMap[`${s.heure_debut}_${s.heure_fin}_${s.jour}`] = s; });

  const openCreate = () => {
    setEditSlot(null);
    setSlotForm({ jour: "lundi", heure_debut: "08:00", heure_fin: "09:00", matiere: "", classe: classes[0]?.id ? String(classes[0].id) : "", enseignant: "", salle: "" });
    setShowModal(true);
  };

  const openEdit = (slot) => {
    setEditSlot(slot);
    setSlotForm({ jour: slot.jour, heure_debut: fmtTime(slot.heure_debut), heure_fin: fmtTime(slot.heure_fin), matiere: slot.matiere, classe: String(slot.classe), enseignant: slot.enseignant ? String(slot.enseignant) : "", salle: slot.salle || "" });
    setShowModal(true);
  };

  const save = async () => {
    const payload = { ...slotForm, classe: slotForm.classe, enseignant: slotForm.enseignant || null };
    if (editSlot) {
      const updated = await emploiApi.update(editSlot.id, payload);
      if (updated?.id) setSlots(prev => prev.map(s => s.id === editSlot.id ? updated : s));
    } else {
      const created = await emploiApi.create(payload);
      if (created?.id) setSlots(prev => [...prev, created]);
    }
    setShowModal(false);
  };

  const deleteSlot = async (id) => {
    if (!window.confirm("Supprimer ce créneau ?")) return;
    await emploiApi.delete(id);
    setSlots(prev => prev.filter(s => s.id !== id));
  };

  const GridView = () => (
    <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "auto", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
        <thead>
          <tr style={{ background: COLORS.primary }}>
            <th style={{ padding: "14px 18px", textAlign: "left", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, letterSpacing: 0.5, whiteSpace: "nowrap" }}>HORAIRE</th>
            {days.map(d => (
              <th key={d} style={{ padding: "14px 18px", color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>{dayLabels[d].toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {heures.length === 0 && (
            <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>Aucun créneau — {isAdmin ? "cliquez sur \"Ajouter un créneau\" pour commencer" : "aucun créneau planifié"}</td></tr>
          )}
          {heures.map((h, i) => (
            <tr key={i} className="table-row" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <td style={{ padding: "12px 18px", fontWeight: 700, color: COLORS.primary, fontSize: 13, whiteSpace: "nowrap" }}>
                {fmtHeure(h.debut, h.fin)}
              </td>
              {days.map(day => {
                const slot = slotMap[`${h.debut}_${h.fin}_${day}`];
                const c = cellColors[day];
                return (
                  <td key={day} style={{ padding: "8px 10px", textAlign: "center" }}>
                    {slot ? (
                      <div style={{ background: `${c}15`, color: c, padding: "6px 8px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${c}30` }}>
                        <div>{slot.matiere}</div>
                        <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{slot.classe_nom}</div>
                        {isAdmin && (
                          <div style={{ display: "flex", gap: 3, justifyContent: "center", marginTop: 5 }}>
                            <button onClick={() => openEdit(slot)} style={{ border: "none", background: "rgba(255,255,255,0.8)", borderRadius: 4, padding: "2px 5px", cursor: "pointer", lineHeight: 1 }}>
                              <Icon name="edit" size={10} color={c} />
                            </button>
                            <button onClick={() => deleteSlot(slot.id)} style={{ border: "none", background: "rgba(255,255,255,0.8)", borderRadius: 4, padding: "2px 5px", cursor: "pointer", lineHeight: 1 }}>
                              <Icon name="trash" size={10} color={COLORS.danger} />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: COLORS.border, fontSize: 16 }}>—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const ListView = () => (
    <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "auto", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
        <thead>
          <tr style={{ background: COLORS.bg, borderBottom: `2px solid ${COLORS.border}` }}>
            {["Jour", "Horaire", "Matière", "Classe", "Enseignant", "Salle", ...(isAdmin ? ["Actions"] : [])].map(h => (
              <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && <tr><td colSpan={isAdmin ? 7 : 6} style={{ padding: 32, textAlign: "center", color: COLORS.muted }}>Aucun créneau</td></tr>}
          {filtered.map(s => (
            <tr key={s.id} className="table-row" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <td style={{ padding: "12px 16px" }}>
                <span style={{ fontWeight: 600, color: cellColors[s.jour] || COLORS.text, textTransform: "capitalize" }}>{s.jour}</span>
              </td>
              <td style={{ padding: "12px 16px", color: COLORS.muted, fontSize: 13, whiteSpace: "nowrap" }}>{fmtHeure(s.heure_debut, s.heure_fin)}</td>
              <td style={{ padding: "12px 16px", fontWeight: 600 }}>{s.matiere}</td>
              <td style={{ padding: "12px 16px" }}>{s.classe_nom}</td>
              <td style={{ padding: "12px 16px", color: COLORS.muted, fontSize: 13 }}>{s.enseignant_nom || "—"}</td>
              <td style={{ padding: "12px 16px", color: COLORS.muted, fontSize: 13 }}>{s.salle || "—"}</td>
              {isAdmin && (
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(s)} style={{ border: "none", background: `${COLORS.secondary}15`, color: COLORS.secondary, borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                      <Icon name="edit" size={14} color={COLORS.secondary} />
                    </button>
                    <button onClick={() => deleteSlot(s.id)} style={{ border: "none", background: "#FEE2E2", color: COLORS.danger, borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                      <Icon name="trash" size={14} color={COLORS.danger} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <PageHeader title="Emploi du temps" subtitle="Planning hebdomadaire de l'établissement"
        action={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 2, background: COLORS.bg, borderRadius: 8, padding: 3 }}>
              {["grille", "liste"].map(v => (
                <button key={v} onClick={() => setViewMode(v)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: viewMode === v ? "#fff" : "transparent", color: viewMode === v ? COLORS.primary : COLORS.muted, fontWeight: 600, fontSize: 12, cursor: "pointer", boxShadow: viewMode === v ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
                  {v === "grille" ? "Grille" : "Liste"}
                </button>
              ))}
            </div>
            {isAdmin && (
              <button onClick={openCreate} className="btn" style={{ background: COLORS.primary, color: "#fff", padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="plus" size={16} color="#fff" /> Ajouter un créneau
              </button>
            )}
          </div>
        }
      />
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => setFilterClasse("tous")} style={{ padding: "7px 16px", borderRadius: 20, fontWeight: 600, fontSize: 12, cursor: "pointer", border: "none", background: filterClasse === "tous" ? COLORS.secondary : COLORS.bg, color: filterClasse === "tous" ? "#fff" : COLORS.muted }}>
          Toutes les classes
        </button>
        {classes.map(c => (
          <button key={c.id} onClick={() => setFilterClasse(String(c.id))} style={{ padding: "7px 16px", borderRadius: 20, fontWeight: 600, fontSize: 12, cursor: "pointer", border: "none", background: String(filterClasse) === String(c.id) ? COLORS.secondary : COLORS.bg, color: String(filterClasse) === String(c.id) ? "#fff" : COLORS.muted }}>
            {c.nom}
          </button>
        ))}
      </div>
      {isMobile || viewMode === "liste" ? <ListView /> : <GridView />}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, overflowY: "auto", padding: "20px 0" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: 18, color: COLORS.text }}>{editSlot ? "Modifier le créneau" : "Nouveau créneau"}</h2>
              <button onClick={() => setShowModal(false)} style={{ border: "none", background: COLORS.bg, borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>Jour</label>
                <select value={slotForm.jour} onChange={e => setSlotForm(p => ({ ...p, jour: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.bg }}>
                  {days.map(d => <option key={d} value={d}>{dayLabels[d]}</option>)}
                </select>
              </div>
              {[
                { label: "Heure début", key: "heure_debut", type: "time" },
                { label: "Heure fin", key: "heure_fin", type: "time" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} value={slotForm[f.key]} onChange={e => setSlotForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.bg, boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>Matière</label>
                <input type="text" value={slotForm.matiere} onChange={e => setSlotForm(p => ({ ...p, matiere: e.target.value }))}
                  placeholder="ex: Mathématiques"
                  style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.bg, boxSizing: "border-box" }} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>Classe</label>
                <select value={slotForm.classe} onChange={e => setSlotForm(p => ({ ...p, classe: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.bg }}>
                  <option value="">— Sélectionner —</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>Enseignant (optionnel)</label>
                <select value={slotForm.enseignant} onChange={e => setSlotForm(p => ({ ...p, enseignant: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.bg }}>
                  <option value="">— Aucun —</option>
                  {enseignants.map(e => <option key={e.id} value={e.id}>{e.nom_complet}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>Salle (optionnel)</label>
                <input type="text" value={slotForm.salle} onChange={e => setSlotForm(p => ({ ...p, salle: e.target.value }))}
                  placeholder="ex: A101"
                  style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.bg, boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "11px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, background: "#fff", color: COLORS.muted, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
              <button onClick={save} style={{ flex: 1, padding: "11px", border: "none", borderRadius: 10, background: COLORS.secondary, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                {editSlot ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MesEnfants({ isMobile, currentUser }) {
  const [enfants, setEnfants] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [selectedEnfant, setSelectedEnfant] = useState(null);
  const [notes, setNotes] = useState([]);
  const [bulletin, setBulletin] = useState(null);
  const [bulletinTrimestre, setBulletinTrimestre] = useState("");

  useEffect(() => {
    elevesApi.list().then(data => { if (Array.isArray(data)) setEnfants(data); });
    absencesApi.list().then(data => { if (Array.isArray(data)) setAbsences(data); });
  }, []);

  const openEnfant = async (enfant) => {
    setSelectedEnfant(enfant);
    setBulletin(null);
    const n = await elevesApi.notes(enfant.id);
    if (Array.isArray(n)) setNotes(n);
  };

  const ouvrirBulletin = async (trimestre = "") => {
    const data = await elevesApi.bulletin(selectedEnfant.id, trimestre || undefined);
    if (data) setBulletin(data);
  };

  const absencesEnfant = selectedEnfant ? absences.filter(a => a.eleve === selectedEnfant.id) : [];

  return (
    <div>
      <PageHeader title="Mes enfants" subtitle="Suivi scolaire de vos enfants" />

      {enfants.length === 0 && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 40, textAlign: "center", color: COLORS.muted, border: `1px solid ${COLORS.border}` }}>
          Aucun enfant associé à votre compte. Contactez l'administration.
        </div>
      )}

      {/* Cartes enfants */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
        {enfants.map(e => {
          const absEnfant = absences.filter(a => a.eleve === e.id);
          const nonJust = absEnfant.filter(a => !a.justifiee).length;
          const moy = e.moyenne !== null && e.moyenne !== undefined ? parseFloat(e.moyenne) : null;
          const moyColor = moy === null ? COLORS.muted : moy >= 14 ? COLORS.success : moy >= 10 ? COLORS.warning : COLORS.danger;
          return (
            <div key={e.id} onClick={() => openEnfant(e)} style={{ background: "#fff", borderRadius: 16, padding: 22, border: `2px solid ${selectedEnfant?.id === e.id ? COLORS.secondary : COLORS.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", cursor: "pointer", transition: "border-color 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.primary})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                  {e.prenom?.[0]}{e.nom?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>{e.prenom} {e.nom}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{e.classe_nom || "Classe non assignée"}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <div style={{ background: `${moyColor}12`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 3 }}>Moyenne</div>
                  <div style={{ fontWeight: 800, color: moyColor, fontSize: 16 }}>{moy !== null ? `${moy.toFixed(1)}` : "—"}</div>
                </div>
                <div style={{ background: `${COLORS.warning}12`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 3 }}>Absences</div>
                  <div style={{ fontWeight: 800, color: COLORS.warning, fontSize: 16 }}>{absEnfant.length}</div>
                </div>
                <div style={{ background: nonJust > 0 ? `${COLORS.danger}12` : `${COLORS.success}12`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase", marginBottom: 3 }}>Non just.</div>
                  <div style={{ fontWeight: 800, color: nonJust > 0 ? COLORS.danger : COLORS.success, fontSize: 16 }}>{nonJust}</div>
                </div>
              </div>
              {moy !== null && moy < 10 && (
                <div style={{ marginTop: 12, padding: "6px 12px", background: `${COLORS.danger}12`, borderRadius: 8, fontSize: 11, color: COLORS.danger, fontWeight: 600 }}>
                  Moyenne en dessous de la moyenne — attention requise
                </div>
              )}
              {nonJust >= 3 && (
                <div style={{ marginTop: 8, padding: "6px 12px", background: `${COLORS.warning}15`, borderRadius: 8, fontSize: 11, color: COLORS.warning, fontWeight: 600 }}>
                  {nonJust} absences non justifiées
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Détail enfant sélectionné */}
      {selectedEnfant && !bulletin && (
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17, color: COLORS.text }}>{selectedEnfant.prenom} {selectedEnfant.nom} — Détail</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <select value={bulletinTrimestre} onChange={e => setBulletinTrimestre(e.target.value)}
                style={{ padding: "7px 10px", borderRadius: 8, border: `1.5px solid ${COLORS.border}`, fontSize: 12, color: COLORS.muted, background: COLORS.bg }}>
                <option value="">Tous trimestres</option>
                <option value="1">Trimestre 1</option>
                <option value="2">Trimestre 2</option>
                <option value="3">Trimestre 3</option>
              </select>
              <button onClick={() => ouvrirBulletin(bulletinTrimestre)} style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "7px 14px", borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="reports" size={13} color="#fff" /> Voir le bulletin
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
            {/* Notes */}
            <div>
              <h4 style={{ fontWeight: 700, fontSize: 14, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Notes ({notes.length})</h4>
              {notes.length === 0 ? (
                <div style={{ color: COLORS.muted, fontSize: 13 }}>Aucune note enregistrée.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {notes.map(n => (
                    <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: COLORS.bg, borderRadius: 10 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{n.matiere} <span style={{ color: COLORS.muted, fontSize: 11 }}>T{n.trimestre}</span></div>
                        {n.commentaire && <div style={{ fontSize: 11, color: COLORS.muted }}>{n.commentaire}</div>}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: parseFloat(n.valeur) >= 10 ? COLORS.success : COLORS.danger }}>
                        {parseFloat(n.valeur).toFixed(1)}/20
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Absences */}
            <div>
              <h4 style={{ fontWeight: 700, fontSize: 14, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Absences ({absencesEnfant.length})</h4>
              {absencesEnfant.length === 0 ? (
                <div style={{ color: COLORS.muted, fontSize: 13 }}>Aucune absence enregistrée.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {absencesEnfant.map(a => (
                    <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: a.justifiee ? `${COLORS.success}10` : `${COLORS.danger}10`, borderRadius: 10 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{a.date} {a.matiere ? `— ${a.matiere}` : ""}</div>
                        {a.commentaire && <div style={{ fontSize: 11, color: COLORS.muted }}>{a.commentaire}</div>}
                      </div>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: a.justifiee ? "#D1FAE5" : "#FEE2E2", color: a.justifiee ? "#065F46" : "#991B1B" }}>
                        {a.justifiee ? "Justifiée" : "Non justifiée"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulletin modal parent */}
      {bulletin && (
        <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17, color: COLORS.text }}>Bulletin — {bulletin.eleve.prenom} {bulletin.eleve.nom}</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => window.print()} style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "7px 14px", borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Imprimer PDF</button>
              <button onClick={() => setBulletin(null)} style={{ background: COLORS.bg, border: "none", padding: "7px 12px", borderRadius: 8, cursor: "pointer" }}><Icon name="x" size={16} color={COLORS.muted} /></button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, marginBottom: 16, background: COLORS.bg, borderRadius: 12, padding: 16 }}>
            <div><div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase" }}>Classe</div><div style={{ fontWeight: 700 }}>{bulletin.eleve.classe || "—"}</div></div>
            <div><div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase" }}>Rang</div><div style={{ fontWeight: 700, color: COLORS.primary }}>{bulletin.rang ? `${bulletin.rang}e / ${bulletin.total_eleves_classe}` : "—"}</div></div>
            <div><div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase" }}>Moyenne générale</div><div style={{ fontWeight: 800, fontSize: 18, color: bulletin.moyenne_generale >= 10 ? COLORS.success : COLORS.danger }}>{bulletin.moyenne_generale !== null ? `${parseFloat(bulletin.moyenne_generale).toFixed(2)}/20` : "—"}</div></div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: COLORS.primary }}>
                {["Matière", "Notes", "Moyenne", "Appréciation"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: h === "Matière" ? "left" : "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {bulletin.matieres.map((m, i) => {
                const moy = m.moyenne;
                const apprec = moy >= 16 ? "Très bien" : moy >= 14 ? "Bien" : moy >= 12 ? "Assez bien" : moy >= 10 ? "Passable" : "Insuffisant";
                const color = moy >= 14 ? COLORS.success : moy >= 10 ? COLORS.warning : COLORS.danger;
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}`, background: i % 2 === 0 ? "#fff" : COLORS.bg }}>
                    <td style={{ padding: "10px 14px", fontWeight: 600, fontSize: 13 }}>{m.matiere}</td>
                    <td style={{ padding: "10px 14px", textAlign: "center", fontSize: 12, color: COLORS.muted }}>{m.notes.map(n => n.valeur).join(" · ")}</td>
                    <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 800, color }}>{moy.toFixed(2)}</td>
                    <td style={{ padding: "10px 14px", textAlign: "center", fontSize: 12, color }}>{apprec}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Absences({ isMobile, currentUser }) {
  const [liste, setListe] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editAbsence, setEditAbsence] = useState(null);
  const [filterPeriode, setFilterPeriode] = useState("aujourd'hui");
  const [filterClasse, setFilterClasse] = useState("tous");
  const [filterJustifiee, setFilterJustifiee] = useState("tous");
  const [form, setForm] = useState({ eleve: "", date: new Date().toISOString().split("T")[0], matiere: "", justifiee: false, commentaire: "" });
  const canEdit = currentUser?.role === "admin" || currentUser?.role === "enseignant";

  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

  const load = () => {
    absencesApi.list().then(data => { if (Array.isArray(data)) setListe(data); });
    elevesApi.list().then(data => { if (Array.isArray(data)) setEleves(data); });
    classesApi.list().then(data => { if (Array.isArray(data)) setClasses(data); });
  };
  useEffect(() => { load(); }, []);

  const filtered = liste.filter(a => {
    if (filterPeriode === "aujourd'hui" && a.date !== today) return false;
    if (filterPeriode === "semaine" && a.date < weekAgo) return false;
    if (filterClasse !== "tous" && a.classe_nom !== filterClasse) return false;
    if (filterJustifiee === "justifiée" && !a.justifiee) return false;
    if (filterJustifiee === "non justifiée" && a.justifiee) return false;
    return true;
  });

  const totalAujourdhui = liste.filter(a => a.date === today).length;
  const totalNonJustifiees = liste.filter(a => !a.justifiee).length;

  const openCreate = () => {
    setEditAbsence(null);
    setForm({ eleve: eleves[0]?.id ? String(eleves[0].id) : "", date: today, matiere: "", justifiee: false, commentaire: "" });
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditAbsence(a);
    setForm({ eleve: String(a.eleve), date: a.date, matiere: a.matiere || "", justifiee: a.justifiee, commentaire: a.commentaire || "" });
    setShowModal(true);
  };

  const save = async () => {
    const payload = { ...form, eleve: parseInt(form.eleve), justifiee: form.justifiee };
    if (editAbsence) {
      const updated = await absencesApi.update(editAbsence.id, payload);
      if (updated?.id) setListe(prev => prev.map(a => a.id === editAbsence.id ? updated : a));
    } else {
      const created = await absencesApi.create(payload);
      if (created?.id) setListe(prev => [created, ...prev]);
    }
    setShowModal(false);
  };

  const deleteAbsence = async (id) => {
    if (!window.confirm("Supprimer cette absence ?")) return;
    await absencesApi.delete(id);
    setListe(prev => prev.filter(a => a.id !== id));
  };

  const toggleJustifiee = async (a) => {
    const updated = await absencesApi.update(a.id, { justifiee: !a.justifiee });
    if (updated?.id) setListe(prev => prev.map(x => x.id === a.id ? updated : x));
  };

  const inputStyle = { width: "100%", padding: "10px 12px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, background: COLORS.bg, boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" };

  return (
    <div>
      <PageHeader title="Absences" subtitle="Suivi des absences par élève et par classe"
        action={canEdit && (
          <button onClick={openCreate} className="btn" style={{ background: COLORS.danger, color: "#fff", padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="plus" size={16} color="#fff" /> Signaler une absence
          </button>
        )}
      />

      {/* Stats rapides */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Absences aujourd'hui", value: totalAujourdhui, color: COLORS.danger },
          { label: "Non justifiées (total)", value: totalNonJustifiees, color: COLORS.warning },
          { label: "Total cette semaine", value: liste.filter(a => a.date >= weekAgo).length, color: COLORS.secondary },
          { label: "Total général", value: liste.length, color: COLORS.primary },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {["aujourd'hui", "semaine", "tout"].map(p => (
          <button key={p} onClick={() => setFilterPeriode(p)} style={{ padding: "7px 16px", borderRadius: 20, fontWeight: 600, fontSize: 12, cursor: "pointer", border: "none", background: filterPeriode === p ? COLORS.primary : COLORS.bg, color: filterPeriode === p ? "#fff" : COLORS.muted }}>
            {p === "aujourd'hui" ? "Aujourd'hui" : p === "semaine" ? "Cette semaine" : "Tout"}
          </button>
        ))}
        <div style={{ width: 1, background: COLORS.border, margin: "0 4px" }} />
        {["tous", "justifiée", "non justifiée"].map(j => (
          <button key={j} onClick={() => setFilterJustifiee(j)} style={{ padding: "7px 16px", borderRadius: 20, fontWeight: 600, fontSize: 12, cursor: "pointer", border: "none", background: filterJustifiee === j ? COLORS.secondary : COLORS.bg, color: filterJustifiee === j ? "#fff" : COLORS.muted }}>
            {j === "tous" ? "Toutes" : j === "justifiée" ? "Justifiées" : "Non justifiées"}
          </button>
        ))}
        <div style={{ width: 1, background: COLORS.border, margin: "0 4px" }} />
        <select value={filterClasse} onChange={e => setFilterClasse(e.target.value)}
          style={{ padding: "7px 14px", borderRadius: 20, fontWeight: 600, fontSize: 12, border: "none", background: filterClasse !== "tous" ? COLORS.bg : COLORS.bg, color: COLORS.muted, cursor: "pointer" }}>
          <option value="tous">Toutes les classes</option>
          {classes.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
        </select>
      </div>

      {/* Tableau */}
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "auto", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
          <thead>
            <tr style={{ background: COLORS.bg, borderBottom: `2px solid ${COLORS.border}` }}>
              {["Élève", "Classe", "Date", "Matière", "Justifiée", "Commentaire", ...(canEdit ? ["Actions"] : [])].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={canEdit ? 7 : 6} style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>
                Aucune absence {filterPeriode === "aujourd'hui" ? "aujourd'hui" : ""}
              </td></tr>
            )}
            {filtered.map(a => (
              <tr key={a.id} className="table-row" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: "12px 16px", fontWeight: 600, color: COLORS.text }}>
                  {a.eleve_prenom} {a.eleve_nom}
                </td>
                <td style={{ padding: "12px 16px", color: COLORS.muted, fontSize: 13 }}>{a.classe_nom || "—"}</td>
                <td style={{ padding: "12px 16px", color: COLORS.muted, fontSize: 13, whiteSpace: "nowrap" }}>{a.date}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{a.matiere || "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  {canEdit ? (
                    <button onClick={() => toggleJustifiee(a)} style={{ padding: "3px 12px", borderRadius: 20, fontWeight: 600, fontSize: 11, border: "none", cursor: "pointer", background: a.justifiee ? "#D1FAE5" : "#FEE2E2", color: a.justifiee ? "#065F46" : "#991B1B" }}>
                      {a.justifiee ? "Justifiée" : "Non justifiée"}
                    </button>
                  ) : (
                    <span style={{ padding: "3px 12px", borderRadius: 20, fontWeight: 600, fontSize: 11, background: a.justifiee ? "#D1FAE5" : "#FEE2E2", color: a.justifiee ? "#065F46" : "#991B1B" }}>
                      {a.justifiee ? "Justifiée" : "Non justifiée"}
                    </span>
                  )}
                </td>
                <td style={{ padding: "12px 16px", color: COLORS.muted, fontSize: 12, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.commentaire || "—"}</td>
                {canEdit && (
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(a)} style={{ border: "none", background: `${COLORS.secondary}15`, borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                        <Icon name="edit" size={14} color={COLORS.secondary} />
                      </button>
                      <button onClick={() => deleteAbsence(a.id)} style={{ border: "none", background: "#FEE2E2", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                        <Icon name="trash" size={14} color={COLORS.danger} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", margin: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: 18, color: COLORS.text }}>{editAbsence ? "Modifier l'absence" : "Signaler une absence"}</h2>
              <button onClick={() => setShowModal(false)} style={{ border: "none", background: COLORS.bg, borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>Élève</label>
              <select value={form.eleve} onChange={e => setForm(p => ({ ...p, eleve: e.target.value }))} style={inputStyle}>
                <option value="">— Sélectionner —</option>
                {eleves.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom} {e.classe_nom ? `(${e.classe_nom})` : ""}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>Date</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>Matière</label>
                <input type="text" value={form.matiere} onChange={e => setForm(p => ({ ...p, matiere: e.target.value }))} placeholder="ex: Mathématiques" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 8 }}>Statut</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[{ val: false, label: "Non justifiée", bg: "#FEE2E2", color: "#991B1B" }, { val: true, label: "Justifiée", bg: "#D1FAE5", color: "#065F46" }].map(opt => (
                  <button key={String(opt.val)} onClick={() => setForm(p => ({ ...p, justifiee: opt.val }))}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: `2px solid ${form.justifiee === opt.val ? opt.color : COLORS.border}`, background: form.justifiee === opt.val ? opt.bg : "#fff", color: form.justifiee === opt.val ? opt.color : COLORS.muted, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>Commentaire (optionnel)</label>
              <textarea value={form.commentaire} onChange={e => setForm(p => ({ ...p, commentaire: e.target.value }))}
                placeholder="Motif, remarque..." rows={3}
                style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "11px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, background: "#fff", color: COLORS.muted, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
              <button onClick={save} style={{ flex: 1, padding: "11px", border: "none", borderRadius: 10, background: COLORS.danger, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                {editAbsence ? "Enregistrer" : "Signaler"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Rapports({ isMobile }) {
  return (
    <div>
      <PageHeader title="Rapports & Analyses" subtitle="Génération et suivi des rapports scolaires" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 16 }}>
        {[
          { title: "Bulletins de notes", desc: "Générer les bulletins T1, T2, T3 pour toutes les classes", icon: "reports", color: COLORS.secondary, action: "Générer" },
          { title: "Rapport financier", desc: "Bilan mensuel, annuel — recettes, dépenses, solde", icon: "finance", color: COLORS.success, action: "Exporter PDF" },
          { title: "Statistiques d'absences", desc: "Taux d'assiduité par classe, par matière", icon: "schedule", color: COLORS.warning, action: "Voir rapport" },
          { title: "Palmares & classements", desc: "Classement des élèves par classe et par matière", icon: "award", color: "#8B5CF6", action: "Consulter" },
          { title: "Suivi pédagogique", desc: "Progression des cours, objectifs atteints par enseignant", icon: "teachers", color: COLORS.danger, action: "Analyser" },
          { title: "Rapport des frais", desc: "État des paiements — payés, partiels, impayés", icon: "students", color: COLORS.primary, action: "Générer" },
        ].map((r, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 22, border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${r.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={r.icon} size={22} color={r.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text, marginBottom: 4 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 14, lineHeight: 1.5 }}>{r.desc}</div>
              <button className="btn" style={{ background: r.color, color: "#fff", padding: "7px 16px", borderRadius: 8, fontWeight: 600, fontSize: 12 }}>{r.action}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CahierTexte({ isMobile, currentUser }) {
  const role = currentUser?.role;
  const isWriter = role === "enseignant";

  // ── Helpers semaine ──────────────────────────────────────────────────────────
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
    date.setHours(0, 0, 0, 0);
    return date;
  };
  const fmtDate  = (d) => d.toISOString().slice(0, 10);
  const fmtShort = (d) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  const fmtLong  = (s) => new Date(s + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" });
  const fmtHeure = (t) => t ? t.slice(0, 5) : "";

  const JOUR_IDX = { lundi: 0, mardi: 1, mercredi: 2, jeudi: 3, vendredi: 4 };
  const JOURS_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

  const TYPE_LABELS = { exercice: "Exercice", lecture: "Lecture", lecon: "Leçon", expose: "Exposé", recherche: "Recherche", dm: "Devoir maison", autre: "Autre" };
  const DUREE_LABELS = { "15min": "15 min", "30min": "30 min", "45min": "45 min", "1h": "1 h", "1h30": "1 h 30", "2h": "2 h", "2h+": "+ 2 h" };

  // ── State ────────────────────────────────────────────────────────────────────
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [entries,   setEntries]   = useState([]);
  const [slots,     setSlots]     = useState([]); // emploi du temps enseignant
  const [classes,   setClasses]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [tab,       setTab]       = useState("semaine"); // "semaine" | "devoirs"
  const [modal,     setModal]     = useState(null);
  const [form,      setForm]      = useState({});
  const [saving,    setSaving]    = useState(false);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 4); // lundi → vendredi

  const prevWeek  = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek  = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
  const thisWeek  = () => setWeekStart(getMonday(new Date()));

  // ── Chargements ──────────────────────────────────────────────────────────────
  useEffect(() => {
    classesApi.list().then(d => setClasses(Array.isArray(d) ? d : []));
    if (isWriter) emploiApi.list().then(d => setSlots(Array.isArray(d) ? d : []));
  }, [isWriter]);

  const reloadEntries = () => {
    setLoading(true);
    cahierApi.list({ date_debut: fmtDate(weekStart), date_fin: fmtDate(weekEnd) })
      .then(d => { setEntries(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(reloadEntries, [weekStart]);

  // ── Données par jour (enseignant : backbone emploi du temps) ─────────────────
  // Map slot.jour + weekStart → date réelle
  const slotsByDay = JOURS_FR.map((jourFr, i) => {
    const jourKey = jourFr.toLowerCase();
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = fmtDate(date);
    const daySlots = slots
      .filter(s => s.jour === jourKey)
      .sort((a, b) => a.heure_debut > b.heure_debut ? 1 : -1)
      .map(s => {
        const entry = entries.find(e =>
          String(e.classe) === String(s.classe) &&
          e.matiere === s.matiere &&
          e.date === dateStr
        );
        return { ...s, date: dateStr, entry };
      });
    // Pour les non-enseignants : juste les entrées du jour
    const dayEntries = entries.filter(e => e.date === dateStr);
    return { jourFr, date: dateStr, daySlots, dayEntries };
  });

  // ── Devoirs à venir (toutes entrées avec devoirs, triées par remise) ─────────
  const devoirsAvenir = [...entries]
    .filter(e => e.devoirs)
    .sort((a, b) => {
      const da = a.date_remise_devoirs || a.date;
      const db = b.date_remise_devoirs || b.date;
      return da > db ? 1 : -1;
    });

  // ── Actions ──────────────────────────────────────────────────────────────────
  const openSlot = (slot) => {
    if (!isWriter) return;
    if (slot.entry) {
      setForm({ ...slot.entry, classe: String(slot.entry.classe) });
      setModal({ mode: "edit", data: slot.entry });
    } else {
      setForm({ date: slot.date, matiere: slot.matiere, classe: String(slot.classe), contenu_cours: "", devoirs: "", type_travail: "", duree_estimee: "", date_remise_devoirs: "" });
      setModal({ mode: "create" });
    }
  };
  const openView  = (entry) => setModal({ mode: "view", data: entry });
  const openNew   = () => {
    setForm({ date: fmtDate(new Date()), matiere: "", classe: "", contenu_cours: "", devoirs: "", type_travail: "", duree_estimee: "", date_remise_devoirs: "" });
    setModal({ mode: "create" });
  };
  const closeModal = () => { setModal(null); setForm({}); };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form };
    if (!payload.date_remise_devoirs) delete payload.date_remise_devoirs;
    if (!payload.type_travail)        delete payload.type_travail;
    if (!payload.duree_estimee)       delete payload.duree_estimee;
    const result = modal.mode === "create"
      ? await cahierApi.create(payload)
      : await cahierApi.update(modal.data.id, payload);
    if (result) reloadEntries();
    setSaving(false);
    closeModal();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette séance du cahier ?")) return;
    await cahierApi.delete(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const inputStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, color: COLORS.text, background: COLORS.bg };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 };
  const today = fmtDate(new Date());

  // ── Stat renseignement (enseignant) ──────────────────────────────────────────
  const totalSlots = slotsByDay.reduce((acc, d) => acc + d.daySlots.length, 0);
  const filledSlots = slotsByDay.reduce((acc, d) => acc + d.daySlots.filter(s => s.entry).length, 0);

  return (
    <div>
      <PageHeader
        title="Cahier de texte"
        subtitle={isWriter ? "Renseignez vos séances — contenu du cours et travail à faire" : "Contenu des cours et devoirs de la semaine"}
        action={isWriter && (
          <button className="btn" onClick={openNew} style={{ background: COLORS.secondary, color: "#fff", padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="plus" size={18} color="#fff" /> Nouvelle séance
          </button>
        )}
      />

      {/* Barre de navigation semaine */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "4px 6px" }}>
          <button className="btn" onClick={prevWeek} style={{ background: "none", padding: "6px 10px", borderRadius: 7, color: COLORS.text, fontWeight: 700, fontSize: 16 }}>‹</button>
          <span style={{ fontWeight: 600, fontSize: 13, color: COLORS.text, minWidth: 160, textAlign: "center" }}>
            {fmtShort(weekStart)} – {fmtShort(weekEnd)}
          </span>
          <button className="btn" onClick={nextWeek} style={{ background: "none", padding: "6px 10px", borderRadius: 7, color: COLORS.text, fontWeight: 700, fontSize: 16 }}>›</button>
        </div>
        <button className="btn" onClick={thisWeek} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.muted, padding: "8px 14px", borderRadius: 8, fontSize: 13 }}>Aujourd'hui</button>

        {/* Tabs vue */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 4, background: COLORS.bg, borderRadius: 10, padding: 4, border: `1px solid ${COLORS.border}` }}>
          {[["semaine", "Semaine"], ["devoirs", "Travail à faire"]].map(([key, label]) => (
            <button key={key} className="btn" onClick={() => setTab(key)}
              style={{ padding: "7px 16px", borderRadius: 7, fontWeight: 600, fontSize: 12, background: tab === key ? "#fff" : "none", color: tab === key ? COLORS.secondary : COLORS.muted, boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              {label}
              {key === "devoirs" && devoirsAvenir.length > 0 && (
                <span style={{ background: COLORS.warning, color: "#fff", borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 700, marginLeft: 6 }}>{devoirsAvenir.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Indicateur de progression (enseignant seulement) */}
      {isWriter && totalSlots > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "12px 18px", marginBottom: 16, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>Séances renseignées cette semaine</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: filledSlots === totalSlots ? COLORS.success : COLORS.warning }}>{filledSlots} / {totalSlots}</span>
            </div>
            <div style={{ background: COLORS.bg, borderRadius: 20, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${(filledSlots / totalSlots) * 100}%`, background: filledSlots === totalSlots ? COLORS.success : COLORS.warning, height: "100%", borderRadius: 20, transition: "width 0.4s" }} />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: COLORS.muted }}>Chargement…</div>
      ) : tab === "devoirs" ? (
        /* ── VUE TRAVAIL À FAIRE ─────────────────────────────────────────── */
        <div>
          {devoirsAvenir.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: COLORS.muted, fontSize: 14 }}>Aucun devoir renseigné pour cette semaine</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {devoirsAvenir.map(e => {
                const remise = e.date_remise_devoirs;
                const daysLeft = remise ? Math.ceil((new Date(remise) - new Date(today)) / 86400000) : null;
                const urgent = daysLeft !== null && daysLeft <= 2;
                return (
                  <div key={e.id} onClick={() => openView(e)} style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", border: `1.5px solid ${urgent ? COLORS.danger : COLORS.border}`, boxShadow: urgent ? `0 0 0 3px ${COLORS.danger}12` : "0 2px 8px rgba(0,0,0,0.04)", cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 4, borderRadius: 4, background: urgent ? COLORS.danger : COLORS.warning, alignSelf: "stretch", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>{e.matiere}</span>
                        {e.classe_nom && <span style={{ background: `${COLORS.primary}15`, color: COLORS.primary, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{e.classe_nom}</span>}
                        {e.type_travail && <span style={{ background: `${COLORS.secondary}12`, color: COLORS.secondary, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{TYPE_LABELS[e.type_travail] || e.type_travail}</span>}
                        {e.duree_estimee && <span style={{ background: COLORS.bg, color: COLORS.muted, borderRadius: 6, padding: "2px 8px", fontSize: 11, border: `1px solid ${COLORS.border}` }}>⏱ {DUREE_LABELS[e.duree_estimee] || e.duree_estimee}</span>}
                      </div>
                      <p style={{ fontSize: 13, color: COLORS.text, margin: "0 0 8px", lineHeight: 1.5 }}>{e.devoirs}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 12, color: COLORS.muted }}>Cours du {fmtLong(e.date)}</span>
                        {remise && (
                          <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: urgent ? COLORS.danger : COLORS.muted }}>
                            À remettre le {new Date(remise + "T00:00:00").toLocaleDateString("fr-FR")}
                            {daysLeft !== null && daysLeft >= 0 && <span style={{ marginLeft: 4 }}>({daysLeft === 0 ? "aujourd'hui !" : `dans ${daysLeft}j`})</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── VUE SEMAINE ─────────────────────────────────────────────────── */
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {slotsByDay.map(({ jourFr, date, daySlots, dayEntries }) => {
            const isToday = date === today;
            // Enseignant : backbone emploi du temps | autres : entrées du jour
            const items = isWriter ? daySlots : dayEntries;
            if (!isWriter && items.length === 0) return null;
            return (
              <div key={jourFr} style={{ background: "#fff", borderRadius: 14, border: `1.5px solid ${isToday ? COLORS.secondary : COLORS.border}`, boxShadow: isToday ? `0 0 0 3px ${COLORS.secondary}14` : "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                {/* En-tête jour */}
                <div style={{ background: isToday ? COLORS.secondary : COLORS.bg, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: isToday ? "#fff" : COLORS.text }}>{jourFr}</span>
                  <span style={{ fontSize: 12, color: isToday ? "rgba(255,255,255,0.7)" : COLORS.muted }}>
                    {new Date(date + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}
                  </span>
                  {isToday && <span style={{ background: "rgba(255,255,255,0.25)", color: "#fff", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700, marginLeft: "auto" }}>Aujourd'hui</span>}
                  {isWriter && !isToday && (
                    <button className="btn" onClick={() => { setForm({ date, matiere: "", classe: "", contenu_cours: "", devoirs: "", type_travail: "", duree_estimee: "", date_remise_devoirs: "" }); setModal({ mode: "create" }); }}
                      style={{ marginLeft: "auto", background: `${COLORS.secondary}15`, color: COLORS.secondary, borderRadius: 7, padding: "4px 12px", fontSize: 11, fontWeight: 600 }}>+ Ajouter</button>
                  )}
                </div>

                {/* Slots / entrées */}
                <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.length === 0 ? (
                    <div style={{ padding: "10px 4px", color: COLORS.muted, fontSize: 13, fontStyle: "italic" }}>
                      {isWriter ? "Aucun cours planifié ce jour" : "Aucun cours renseigné"}
                    </div>
                  ) : isWriter ? (
                    /* ── Slots enseignant style Pronote ─── */
                    items.map((slot, idx) => {
                      const done = !!slot.entry;
                      return (
                        <div key={idx} onClick={() => openSlot(slot)}
                          style={{ display: "flex", gap: 0, borderRadius: 10, border: `1px solid ${done ? "#BBF7D0" : `${COLORS.warning}40`}`, background: done ? "#F0FDF4" : `${COLORS.warning}08`, cursor: "pointer", overflow: "hidden", transition: "box-shadow 0.15s" }}>
                          {/* Heure */}
                          <div style={{ background: done ? "#D1FAE5" : `${COLORS.warning}18`, padding: "12px 14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 70, gap: 2 }}>
                            <span style={{ fontWeight: 700, fontSize: 12, color: done ? COLORS.success : COLORS.warning }}>{fmtHeure(slot.heure_debut)}</span>
                            <span style={{ fontSize: 10, color: done ? "#6EE7B7" : `${COLORS.warning}99` }}>→</span>
                            <span style={{ fontWeight: 700, fontSize: 12, color: done ? COLORS.success : COLORS.warning }}>{fmtHeure(slot.heure_fin)}</span>
                          </div>
                          {/* Contenu */}
                          <div style={{ flex: 1, padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                              <span style={{ fontWeight: 700, fontSize: 13, color: COLORS.text }}>{slot.matiere}</span>
                              <span style={{ background: `${COLORS.primary}15`, color: COLORS.primary, borderRadius: 6, padding: "1px 8px", fontSize: 11, fontWeight: 600 }}>{slot.classe_nom}</span>
                              {slot.salle && <span style={{ color: COLORS.muted, fontSize: 11 }}>Salle {slot.salle}</span>}
                              <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: done ? COLORS.success : COLORS.warning }}>
                                {done ? "✓ Renseigné" : "À renseigner"}
                              </span>
                            </div>
                            {done && slot.entry.contenu_cours && (
                              <p style={{ fontSize: 12, color: COLORS.muted, margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{slot.entry.contenu_cours}</p>
                            )}
                            {done && slot.entry.devoirs && (
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                                <span style={{ background: `${COLORS.warning}20`, color: COLORS.warning, borderRadius: 6, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>
                                  {slot.entry.type_travail ? (TYPE_LABELS[slot.entry.type_travail] || slot.entry.type_travail) : "Devoir"}
                                </span>
                                {slot.entry.duree_estimee && <span style={{ fontSize: 11, color: COLORS.muted }}>⏱ {DUREE_LABELS[slot.entry.duree_estimee]}</span>}
                                {slot.entry.date_remise_devoirs && <span style={{ fontSize: 11, color: COLORS.muted, marginLeft: "auto" }}>Remise {new Date(slot.entry.date_remise_devoirs + "T00:00:00").toLocaleDateString("fr-FR")}</span>}
                              </div>
                            )}
                          </div>
                          {/* Actions */}
                          <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }} onClick={e => e.stopPropagation()}>
                            {done && <>
                              <button className="btn" onClick={() => openSlot(slot)} style={{ background: `${COLORS.secondary}15`, color: COLORS.secondary, borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 600 }}>Modifier</button>
                              <button className="btn" onClick={() => handleDelete(slot.entry.id)} style={{ background: `${COLORS.danger}12`, color: COLORS.danger, borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 600 }}>Suppr.</button>
                            </>}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* ── Entrées élève / parent / admin ─── */
                    items.map(entry => (
                      <div key={entry.id} onClick={() => openView(entry)}
                        style={{ background: COLORS.bg, borderRadius: 10, padding: "12px 14px", border: `1px solid ${COLORS.border}`, cursor: "pointer" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: entry.contenu_cours || entry.devoirs ? 6 : 0 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: COLORS.text }}>{entry.matiere}</span>
                          {entry.classe_nom && <span style={{ background: `${COLORS.primary}15`, color: COLORS.primary, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{entry.classe_nom}</span>}
                          {entry.enseignant_nom && <span style={{ color: COLORS.muted, fontSize: 12 }}>{entry.enseignant_nom}</span>}
                        </div>
                        {entry.contenu_cours && <p style={{ fontSize: 12, color: COLORS.text, margin: "0 0 6px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{entry.contenu_cours}</p>}
                        {entry.devoirs && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ background: `${COLORS.warning}20`, color: COLORS.warning, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                              {entry.type_travail ? (TYPE_LABELS[entry.type_travail] || entry.type_travail) : "Devoir"}
                            </span>
                            {entry.duree_estimee && <span style={{ fontSize: 11, color: COLORS.muted }}>⏱ {DUREE_LABELS[entry.duree_estimee]}</span>}
                            <span style={{ fontSize: 12, color: COLORS.muted }}>{entry.devoirs.slice(0, 70)}{entry.devoirs.length > 70 ? "…" : ""}</span>
                            {entry.date_remise_devoirs && <span style={{ marginLeft: "auto", fontSize: 11, color: COLORS.muted }}>Remise {new Date(entry.date_remise_devoirs + "T00:00:00").toLocaleDateString("fr-FR")}</span>}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
          {!isWriter && slotsByDay.every(d => d.dayEntries.length === 0) && (
            <div style={{ textAlign: "center", padding: 60, color: COLORS.muted, fontSize: 14 }}>Aucun cours renseigné pour cette semaine</div>
          )}
        </div>
      )}

      {/* ── MODAL ─────────────────────────────────────────────────────────── */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 580, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            {modal.mode === "view" ? (
              /* Lecture seule */
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontWeight: 700, fontSize: 18, color: COLORS.text }}>{modal.data.matiere}</h2>
                  <button onClick={closeModal} style={{ background: COLORS.bg, border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: COLORS.muted, fontSize: 16 }}>✕</button>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                  {modal.data.classe_nom && <span style={{ background: `${COLORS.primary}15`, color: COLORS.primary, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{modal.data.classe_nom}</span>}
                  <span style={{ background: COLORS.bg, color: COLORS.muted, borderRadius: 6, padding: "3px 10px", fontSize: 12 }}>{fmtLong(modal.data.date)}</span>
                  {modal.data.enseignant_nom && <span style={{ background: COLORS.bg, color: COLORS.muted, borderRadius: 6, padding: "3px 10px", fontSize: 12 }}>{modal.data.enseignant_nom}</span>}
                </div>
                {modal.data.contenu_cours && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Contenu du cours</div>
                    <div style={{ background: COLORS.bg, borderRadius: 10, padding: 14, fontSize: 13, color: COLORS.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{modal.data.contenu_cours}</div>
                  </div>
                )}
                {modal.data.devoirs && (
                  <div style={{ background: `${COLORS.warning}08`, border: `1px solid ${COLORS.warning}30`, borderRadius: 12, padding: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: COLORS.warning, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Travail à faire</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                      {modal.data.type_travail && <span style={{ background: `${COLORS.secondary}15`, color: COLORS.secondary, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{TYPE_LABELS[modal.data.type_travail] || modal.data.type_travail}</span>}
                      {modal.data.duree_estimee && <span style={{ background: COLORS.bg, color: COLORS.muted, borderRadius: 6, padding: "3px 10px", fontSize: 12, border: `1px solid ${COLORS.border}` }}>⏱ {DUREE_LABELS[modal.data.duree_estimee]}</span>}
                    </div>
                    <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: modal.data.date_remise_devoirs ? 10 : 0 }}>{modal.data.devoirs}</div>
                    {modal.data.date_remise_devoirs && (
                      <div style={{ fontSize: 12, color: COLORS.muted, fontStyle: "italic" }}>
                        À remettre le {new Date(modal.data.date_remise_devoirs + "T00:00:00").toLocaleDateString("fr-FR")}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Formulaire create / edit */
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ fontWeight: 700, fontSize: 18, color: COLORS.text }}>
                    {modal.mode === "create" ? "Nouvelle séance" : "Modifier la séance"}
                  </h2>
                  <button onClick={closeModal} style={{ background: COLORS.bg, border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: COLORS.muted, fontSize: 16 }}>✕</button>
                </div>

                {/* Classe + Date + Matière */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={labelStyle}>Classe *</label>
                    <select value={form.classe || ""} onChange={e => setForm(f => ({ ...f, classe: e.target.value }))} style={inputStyle}>
                      <option value="">-- Choisir --</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Date *</label>
                    <input type="date" value={form.date || ""} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Matière *</label>
                  <input value={form.matiere || ""} onChange={e => setForm(f => ({ ...f, matiere: e.target.value }))} placeholder="Ex : Mathématiques" style={inputStyle} />
                </div>

                {/* Contenu du cours */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Contenu du cours</label>
                  <textarea value={form.contenu_cours || ""} onChange={e => setForm(f => ({ ...f, contenu_cours: e.target.value }))}
                    rows={4} placeholder="Chapitres abordés, notions vues en classe…" style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
                </div>

                {/* Séparateur Travail à faire */}
                <div style={{ borderTop: `1px solid ${COLORS.border}`, margin: "4px 0 16px", position: "relative" }}>
                  <span style={{ position: "absolute", top: -10, left: 0, background: "#fff", paddingRight: 10, fontSize: 11, fontWeight: 700, color: COLORS.warning, textTransform: "uppercase", letterSpacing: 0.5 }}>Travail à faire</span>
                </div>

                {/* Nature + Durée estimée OU Date de remise selon le type */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={labelStyle}>Nature du travail</label>
                    <select value={form.type_travail || ""} onChange={e => setForm(f => ({ ...f, type_travail: e.target.value, duree_estimee: e.target.value === "dm" ? "" : f.duree_estimee }))} style={inputStyle}>
                      <option value="">-- Aucune --</option>
                      {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    {form.type_travail === "dm" ? (
                      <>
                        <label style={labelStyle}>Date de remise *</label>
                        <input type="date" value={form.date_remise_devoirs || ""} onChange={e => setForm(f => ({ ...f, date_remise_devoirs: e.target.value }))} style={{ ...inputStyle, borderColor: COLORS.warning }} />
                      </>
                    ) : (
                      <>
                        <label style={labelStyle}>Durée estimée</label>
                        <select value={form.duree_estimee || ""} onChange={e => setForm(f => ({ ...f, duree_estimee: e.target.value }))} style={inputStyle}>
                          <option value="">-- Aucune --</option>
                          {Object.entries(DUREE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Description du travail</label>
                  <textarea value={form.devoirs || ""} onChange={e => setForm(f => ({ ...f, devoirs: e.target.value }))}
                    rows={3} placeholder="Ex : Exercices 3, 5 et 7 page 48 — à corriger au propre" style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
                </div>
                {form.type_travail !== "dm" && (
                <div style={{ marginBottom: 22 }}>
                  <label style={labelStyle}>Date de remise</label>
                  <input type="date" value={form.date_remise_devoirs || ""} onChange={e => setForm(f => ({ ...f, date_remise_devoirs: e.target.value }))} style={inputStyle} />
                </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button className="btn" onClick={closeModal} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, padding: "10px 20px", borderRadius: 8, fontWeight: 600, fontSize: 14 }}>Annuler</button>
                  <button className="btn" onClick={handleSave} disabled={saving || !form.classe || !form.date || !form.matiere}
                    style={{ background: saving ? COLORS.muted : COLORS.secondary, color: "#fff", padding: "10px 24px", borderRadius: 8, fontWeight: 600, fontSize: 14, opacity: !form.classe || !form.date || !form.matiere ? 0.5 : 1 }}>
                    {saving ? "Enregistrement…" : "Enregistrer la séance"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Parametres({ isMobile }) {
  return (
    <div>
      <PageHeader title="Paramètres" subtitle="Configuration de l'établissement" />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 20 }}>
        {[
          { section: "Informations de l'établissement", fields: ["Nom de l'établissement", "Adresse", "Téléphone", "Email officiel", "Directeur"] },
          { section: "Année scolaire", fields: ["Date de début", "Date de fin", "Nombre de trimestres", "Vacances scolaires"] },
          { section: "Frais scolaires", fields: ["Frais d'inscription", "Frais de scolarité T1", "Frais cantine", "Frais transport"] },
          { section: "Notifications", fields: ["Alertes paiement", "Bulletins disponibles", "Absences parents", "Réunions"] },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: COLORS.text, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}` }}>{s.section}</h3>
            {s.fields.map((f, j) => (
              <div key={j} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, display: "block", marginBottom: 6 }}>{f}</label>
                <input defaultValue="" placeholder={`Entrer ${f.toLowerCase()}`} style={{
                  width: "100%", padding: "9px 12px", border: `1px solid ${COLORS.border}`,
                  borderRadius: 8, fontSize: 13, color: COLORS.text, background: COLORS.bg,
                  transition: "all 0.2s"
                }} />
              </div>
            ))}
            <button className="btn" style={{ background: COLORS.secondary, color: "#fff", padding: "9px 20px", borderRadius: 8, fontWeight: 600, fontSize: 13, marginTop: 4 }}>Sauvegarder</button>
          </div>
        ))}
      </div>
    </div>
  );
}
