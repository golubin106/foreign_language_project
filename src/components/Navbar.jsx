import { Link, useNavigate } from "react-router-dom";
import { clearSession, getCurrentUser, isAdmin, isAuthenticated } from "../utils/auth";

function Navbar() {
  const navigate = useNavigate();

  const loggedIn = isAuthenticated();
  const admin = isAdmin();
  const user = getCurrentUser();

  function handleLogout() {
    clearSession();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        LinguaLearn
      </Link>

      <div className="navLinks">
        <Link to="/">Главная</Link>
        <Link to="/lessons">Уроки</Link>

        {admin && <Link to="/admin">Админ</Link>}

        {loggedIn ? (
          <>
            <Link to="/profile" className="accountLink">
              {user?.name ? user.name : "Профиль"}
            </Link>

            <button className="logoutButton" onClick={handleLogout}>
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Вход</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
