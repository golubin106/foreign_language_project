import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUser } from "../utils/auth";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(event) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов.");
      return;
    }

    try {
      await createUser({ name, email, password, adminCode });
      navigate("/profile");
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <main className="page">
      <div className="authBox">
        <p className="badge">Регистрация</p>
        <h1>Создать аккаунт</h1>
        <p className="authText">
          Создайте учебный профиль для сохранения результатов тестов.
        </p>

        {error && <p className="formError">{error}</p>}

        <form onSubmit={handleRegister} className="authForm" autoComplete="off">
          <label>
            Имя
            <input
              type="text"
              placeholder="Введите имя"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

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
              autoComplete="new-password"
              required
              minLength="6"
            />
          </label>

          <label>
            Повторите пароль
            <input
              type="password"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength="6"
            />
          </label>

          <label>
            Код администратора
            <input
              type="text"
              placeholder="Заполняется только для администратора"
              value={adminCode}
              onChange={(event) => setAdminCode(event.target.value)}
            />
          </label>

          <button type="submit" className="primaryButton">
            Зарегистрироваться
          </button>
        </form>

        <p className="authFooter">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </main>
  );
}

export default Register;
