import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/auth";
import { apiRequest } from "../utils/api";

function Profile() {
  const [results, setResults] = useState([]);
  const [lessonCount, setLessonCount] = useState(0);
  const [error, setError] = useState("");

  const user = getCurrentUser();

  useEffect(() => {
    async function loadProfileData() {
      try {
        const [lessonsData, resultsData] = await Promise.all([
          apiRequest("/lessons"),
          apiRequest("/results"),
        ]);

        setLessonCount(lessonsData.lessons?.length || 0);
        setResults(resultsData.results || []);
      } catch (error) {
        setError(error.message);
      }
    }

    loadProfileData();
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
    lessonCount > 0 ? Math.round((completedLessons / lessonCount) * 100) : 0;

  async function clearProgress() {
    try {
      await apiRequest("/results", { method: "DELETE" });
      setResults([]);
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <main className="page">
      <div className="profileBox">
        <p className="badge">Профиль</p>

        <h1>Личный кабинет</h1>

        {error && <p className="formError">{error}</p>}

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
