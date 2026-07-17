// Side navigation bar.
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const linkStyle = ({ isActive }) => ({
  display: "block",
  padding: "0.7rem 1rem",
  borderRadius: "8px",
  color: isActive ? "white" : "var(--text-dim)",
  background: isActive ? "var(--primary)" : "transparent",
  marginBottom: "0.25rem",
});

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav
      style={{
        width: "220px",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        padding: "1.25rem 1rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
        OmniStudent
      </h2>
      <NavLink to="/" style={linkStyle} end>
        Dashboard
      </NavLink>
      <NavLink to="/calendar" style={linkStyle}>
        Calendar
      </NavLink>
      <NavLink to="/tasks" style={linkStyle}>
        Tasks
      </NavLink>
      <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
        <p className="muted" style={{ fontSize: "0.85rem" }}>
          {user?.name}
        </p>
        <button
          className="secondary"
          onClick={handleLogout}
          style={{ marginTop: "0.5rem" }}
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
