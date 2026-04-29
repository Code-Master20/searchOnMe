import { Link, NavLink } from "react-router-dom";
import { navLinks } from "../../data/siteContent";
import styles from "./Header.module.css";

function Header() {
  return (
    <header className={styles.topbar}>
      <Link className={styles.brand} to="/">
        <span className={styles.brandMark}>S</span>
        <span className={styles.brandCopy}>
          <strong>searchOnMe</strong>
          <small>Portfolio of Sahidur Miah</small>
        </span>
      </Link>

      <nav className={styles.nav}>
        {navLinks.map((link) => (
          <NavLink
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`.trim()}
            to={link.href}
            key={link.href}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Header;
