import { useEffect, useState } from "react";
import { getLessons } from "../data/getLessons";
import { getCurrentUser } from "../utils/auth";
import { readArray } from "../utils/storage";

function Profile() {
  const [results, setResults] = useState([]);
  const lessons = getLessons();

  const user = getCurrentUser();

  useEffect(() => {
    setResults(readArray("quizResults"));
  }, []);

  const completedLessons = results.length;

  const averagePercent =
    results.length > 0
      ? Math.round(
          results.reduce((sum, item) => sum + (item.percent || 0), 0) /
            results.length
        )
      : 0;

  const progressPercent =
    lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

  function clearProgress() {
    localStorage.removeItem("quizResults");
    setResults([]);
  }

  return (
    <main className="page">
      <div className="profileBox">
        <p className="badge">Профиль</p>

        <h1>Личный кабинет</h1>

        <div className="userCard">
          <div className="avatarCircle">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>

          <div>
            <h2>{user?.name || "Пользователь"}</h2>
            <p>{user?.email || "Email не указан"}</p>
            <span>
              Роль: {user?.role === "admin" ? "Администратор" : "Ученик"}
            </span>
            <span>
              Дата регистрации: {user?.createdAt || "Неизвестно"}
            </span>
          </div>
        </div>

        <h2 className="sectionTitle">Прогресс обучения</h2>

        <div className="statsGrid">
          <div className="statCard">
            <h2>{completedLessons}</h2>
            <p>Пройденных уроков</p>
          </div>

          <div className="statCard">
            <h2>{averagePercent}%</h2>
            <p>Средний результат</p>
          </div>

          <div className="statCard">
            <h2>{progressPercent}%</h2>
            <p>Общий прогресс</p>
          </div>
        </div>

        <h2 className="sectionTitle">История прохождения</h2>

        {results.length === 0 ? (
          <p className="emptyText">
            Вы еще не прошли ни одного теста. Перейдите в раздел уроков и
            начните обучение.
          </p>
        ) : (
          <div className="historyList">
            {results.map((item) => (
              <div className="historyItem" key={item.lessonId}>
                <div>
                  <h3>{item.lessonTitle}</h3>
                  <p>
                    Уровень: {item.level} | Дата: {item.completedAt}
                  </p>
                </div>

                <strong>
                  {item.score}/{item.total} - {item.percent}%
                </strong>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <button className="dangerButton" onClick={clearProgress}>
            Очистить прогресс
          </button>
        )}
      </div>
    </main>
  );
}

export default Profile;
