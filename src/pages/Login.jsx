import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../utils/auth";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setError("");

    try {
      await loginUser({ email, password });
      navigate("/profile");
    } catch (error) {
      setError(error.message);
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

        {error && <p className="formError">{error}</p>}

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
