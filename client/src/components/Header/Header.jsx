import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import useAdminSession from "../../hooks/useAdminSession";
import { navLinks } from "../../data/siteContent";
import styles from "./Header.module.css";

const adminHiddenNavLinks = new Set(["/help", "/contact", "/responses"]);

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin } = useAdminSession();
  const visibleNavLinks = isAdmin
    ? navLinks.filter((link) => !adminHiddenNavLinks.has(link.href))
    : navLinks;

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={styles.topbar}>
      <Link className={styles.brand} to="/" onClick={closeMenu}>
        <span className={styles.brandMark}>S</span>
        <span className={styles.brandCopy}>
          <strong>searchOnMe</strong>
          <small>Portfolio of Sahidur Miah</small>
        </span>
      </Link>

      <button
        type="button"
        className={styles.menuButton}
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`.trim()}>
        {visibleNavLinks.map((link) => (
          <NavLink
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`.trim()}
            to={link.href}
            key={link.href}
            onClick={closeMenu}
          >
            {link.label}
          </NavLink>
        ))}
        {isAdmin ? (
          <NavLink
            className={({ isActive }) =>
              `${styles.navLink} ${styles.adminPanelLink} ${isActive ? styles.active : ""}`.trim()
            }
            to="/admin/panel"
            onClick={closeMenu}
          >
            Admin Panel
          </NavLink>
        ) : null}
      </nav>
    </header>
  );
}

export default Header;
