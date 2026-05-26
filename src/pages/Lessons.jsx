import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isAdmin } from "../utils/auth";
import { apiRequest } from "../utils/api";

function Lessons() {
  const admin = isAdmin();

  const [lessons, setLessons] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [sortType, setSortType] = useState("default");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLessons() {
      try {
        const data = await apiRequest("/lessons");
        setLessons(data.lessons || []);
      } catch (error) {
        setError(error.message);
      }
    }

    loadLessons();
  }, []);

  const filteredLessons = [...lessons]
    .filter((lesson) => {
      const matchesSearch =
        lesson.title.toLowerCase().includes(searchText.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchText.toLowerCase());

      const matchesLevel =
        selectedLevel === "all" || lesson.level === selectedLevel;

      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      if (sortType === "title") {
        return a.title.localeCompare(b.title);
      }

      if (sortType === "level") {
        return a.level.localeCompare(b.level);
      }

      return 0;
    });

  async function deleteLesson(id) {
    if (!admin) {
      return;
    }

    const confirmDelete = window.confirm("Удалить этот урок из каталога?");

    if (!confirmDelete) {
      return;
    }

    try {
      await apiRequest(`/lessons/${id}`, { method: "DELETE" });
      setLessons((currentLessons) =>
        currentLessons.filter((lesson) => lesson.id !== id)
      );
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <main className="page">
      <div className="pageHeader">
        <p className="badge">Каталог уроков</p>

        <h1>Уроки английского языка</h1>

        <p>
          Выберите урок, изучите новые слова и пройдите небольшой тест для
          проверки знаний.
        </p>

        {admin && (
          <div className="headerActions">
            <Link to="/admin" className="secondaryButton">
              Добавить урок
            </Link>
          </div>
        )}
      </div>

      {error && <p className="formError">{error}</p>}

      <div className="filtersBox">
        <input
          type="text"
          placeholder="Поиск по названию или описанию..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />

        <select
          value={selectedLevel}
          onChange={(event) => setSelectedLevel(event.target.value)}
        >
          <option value="all">Все уровни</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
        </select>

        <select
          value={sortType}
          onChange={(event) => setSortType(event.target.value)}
        >
          <option value="default">Без сортировки</option>
          <option value="title">По названию</option>
          <option value="level">По уровню</option>
        </select>
      </div>

      {filteredLessons.length === 0 ? (
        <div className="emptyLessons">
          <h2>Уроки не найдены</h2>
          <p>Попробуйте изменить поисковый запрос или уровень.</p>
        </div>
      ) : (
        <div className="lessonGrid">
          {filteredLessons.map((lesson) => (
            <div className="lessonCard" key={lesson.id}>
              <span className="level">{lesson.level}</span>

              <h2>{lesson.title}</h2>
              <p>{lesson.description}</p>

              <div className="lessonActions">
                <Link to={`/lessons/${lesson.id}`} className="cardButton">
                  Открыть урок
                </Link>

                {admin && (
                  <>
                    <Link to={`/admin/${lesson.id}`} className="editLessonButton">
                      Редактировать
                    </Link>

                    <button
                      className="deleteLessonButton"
                      onClick={() => deleteLesson(lesson.id)}
                    >
                      Удалить
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Lessons;
