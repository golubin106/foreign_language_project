import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const user = JSON.parse(localStorage.getItem("user"));

  function handleLogout() {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
    window.location.reload();
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        LinguaLearn
      </Link>

      <div className="navLinks">
        <Link to="/">Главная</Link>
        <Link to="/lessons">Уроки</Link>

        {isLoggedIn ? (
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
