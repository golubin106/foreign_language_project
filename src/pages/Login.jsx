import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(event) {
    event.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser) {
      alert("Пользователь не найден. Сначала зарегистрируйтесь.");
      return;
    }

    if (savedUser.email === email && savedUser.password === password) {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/profile");
    } else {
      alert("Неверный email или пароль.");
    }
  }

  return (
    <main className="page">
      <div className="authBox">
        <p className="badge">Вход</p>
        <h1>Войти в аккаунт</h1>
        <p className="authText">
          Войдите, чтобы продолжить обучение и отслеживать свой прогресс.
        </p>

        <form onSubmit={handleLogin} className="authForm" autoComplete="off">
          <label>
            Email
            <input
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Пароль
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className="primaryButton">
            Войти
          </button>
        </form>

        <p className="authFooter">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
