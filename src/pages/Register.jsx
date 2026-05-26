import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleRegister(event) {
    event.preventDefault();

    const newUser = {
      name,
      email,
      password,
      createdAt: new Date().toLocaleString(),
    };

    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("isLoggedIn", "true");

    navigate("/profile");
  }

  return (
    <main className="page">
      <div className="authBox">
        <p className="badge">Регистрация</p>
        <h1>Создать аккаунт</h1>
        <p className="authText">
          Создайте учебный профиль для сохранения результатов тестов.
        </p>

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
              minLength="4"
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
