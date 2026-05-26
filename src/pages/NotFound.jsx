import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="page">
      <div className="emptyLessons">
        <p className="badge">404</p>
        <h1>Страница не найдена</h1>
        <p>Такого раздела нет или адрес был введен с ошибкой.</p>
        <Link to="/" className="primaryButton">
          На главную
        </Link>
      </div>
    </main>
  );
}

export default NotFound;
