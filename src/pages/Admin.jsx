import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../utils/api";

function formatQuestions(questions = []) {
  return questions
    .map((question) => {
      const options = Array.isArray(question.options) ? question.options.join("\n") : "";
      return [question.question, options, `Ответ: ${question.answer || ""}`]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

function parseQuestions(text) {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const answerLineIndex = lines.findIndex((line) =>
        line.toLowerCase().startsWith("ответ:")
      );

      if (lines.length < 4 || answerLineIndex === -1) {
        return null;
      }

      const question = lines[0];
      const answer = lines[answerLineIndex].replace(/^ответ:\s*/i, "").trim();
      const options = lines.slice(1, answerLineIndex);
      const uniqueOptions = [...new Set(options)];

      if (!question || uniqueOptions.length < 2 || !uniqueOptions.includes(answer)) {
        return null;
      }

      return {
        question,
        options: uniqueOptions,
        answer,
      };
    });
}

function Admin() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editId = id ? Number(id) : null;
  const isEditMode = Boolean(editId);

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("A1");
  const [description, setDescription] = useState("");
  const [wordsText, setWordsText] = useState("");
  const [questionsText, setQuestionsText] = useState("");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [roleMessage, setRoleMessage] = useState("");

  useEffect(() => {
    async function loadLesson() {
      if (!isEditMode) {
        return;
      }

      try {
        const data = await apiRequest("/lessons");
        const lesson = data.lessons.find((item) => item.id === editId);

        if (!lesson) {
          alert("Урок не найден");
          navigate("/lessons");
          return;
        }

        setTitle(lesson.title);
        setLevel(lesson.level);
        setDescription(lesson.description);
        setWordsText(
          lesson.words
            .map((word) => `${word.english} - ${word.russian}`)
            .join("\n")
        );
        setQuestionsText(formatQuestions(lesson.questions));
      } catch (error) {
        setError(error.message);
      }
    }

    loadLesson();
  }, [editId, isEditMode, navigate]);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [usersData, statsData] = await Promise.all([
          apiRequest("/users"),
          apiRequest("/admin/stats"),
        ]);

        setUsers(usersData.users || []);
        setStats(statsData.stats || null);
      } catch (error) {
        setRoleMessage(error.message);
      }
    }

    loadAdminData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      setError("Заполните название и описание урока.");
      return;
    }

    const words = wordsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [english, ...translationParts] = line.split(/\s*[-—]\s*/);
        const russian = translationParts.join(" - ");

        return {
          english: english ? english.trim() : "",
          russian: russian ? russian.trim() : "",
        };
      });

    const hasIncorrectWords = words.some(
      (word) => word.english === "" || word.russian === ""
    );

    if (words.length === 0 || hasIncorrectWords) {
      setError("Проверьте поле 'Слова'. Формат: English - Русский перевод.");
      return;
    }

    const questions = parseQuestions(questionsText);

    if (questions.length === 0 || questions.some((question) => question === null)) {
      setError(
        "Проверьте блоки теста. Формат: вопрос, варианты ответов каждый с новой строки, затем строка 'Ответ: правильный вариант'. Между вопросами оставляйте пустую строку."
      );
      return;
    }

    const lesson = {
      id: isEditMode ? editId : Date.now(),
      title: trimmedTitle,
      level,
      description: trimmedDescription,
      words,
      questions,
    };

    try {
      await apiRequest(isEditMode ? `/lessons/${editId}` : "/lessons", {
        method: isEditMode ? "PUT" : "POST",
        body: JSON.stringify(lesson),
      });

      navigate("/lessons");
    } catch (error) {
      setError(error.message);
    }
  }

  async function updateUserRole(userId, role) {
    setRoleMessage("");

    try {
      const data = await apiRequest(`/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      const statsData = await apiRequest("/admin/stats");

      setUsers(data.users || []);
      setStats(statsData.stats || null);
      setRoleMessage("Роль пользователя обновлена.");
    } catch (error) {
      setRoleMessage(error.message);
    }
  }

  return (
    <main className="page">
      <section className="adminBox adminStatsBox">
        <div className="adminHeader">
          <p className="badge">Статистика</p>
          <h1>Обзор платформы</h1>
          <p>
            Сводка показывает активность пользователей, результаты тестов и
            распределение прогресса по уровням.
          </p>
        </div>

        <div className="adminStatsGrid">
          <div className="adminStatCard">
            <h2>{stats?.summary.users || 0}</h2>
            <p>Пользователей</p>
          </div>
          <div className="adminStatCard">
            <h2>{stats?.summary.lessons || 0}</h2>
            <p>Уроков</p>
          </div>
          <div className="adminStatCard">
            <h2>{stats?.summary.results || 0}</h2>
            <p>Тестов пройдено</p>
          </div>
          <div className="adminStatCard">
            <h2>{stats?.summary.averagePercent || 0}%</h2>
            <p>Средний результат</p>
          </div>
        </div>

        <div className="adminAnalyticsGrid">
          <div className="analyticsPanel">
            <h3>По уровням</h3>
            {stats?.levelStats.length ? (
              <div className="levelStatsList">
                {stats.levelStats.map((item) => (
                  <div className="levelStatsItem" key={item.level}>
                    <span>{item.level}</span>
                    <strong>{item.averagePercent}%</strong>
                    <small>{item.attempts} попыток</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="emptyText">Пока нет результатов тестов.</p>
            )}
          </div>

          <div className="analyticsPanel">
            <h3>Популярные уроки</h3>
            {stats?.lessonStats.length ? (
              <div className="compactList">
                {stats.lessonStats.map((item) => (
                  <div className="compactListItem" key={item.lessonId}>
                    <span>{item.title}</span>
                    <strong>{item.attempts} попыток</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="emptyText">Уроки еще не проходили.</p>
            )}
          </div>
        </div>

        <div className="analyticsPanel recentPanel">
          <h3>Последние прохождения</h3>
          {stats?.recentResults.length ? (
            <div className="compactList">
              {stats.recentResults.map((item, index) => (
                <div className="compactListItem" key={`${item.userEmail}-${index}`}>
                  <span>
                    {item.userName} - {item.lessonTitle}
                  </span>
                  <strong>{item.percent}%</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="emptyText">Недавних прохождений пока нет.</p>
          )}
        </div>
      </section>

      <div className="adminBox">
        <div className="adminHeader">
          <p className="badge">
            {isEditMode ? "Редактирование" : "Админ-панель"}
          </p>

          <h1>
            {isEditMode ? "Редактировать урок" : "Добавить новый урок"}
          </h1>

          <p>
            {isEditMode
              ? "Измените данные урока и сохраните обновленную версию."
              : "Заполните форму, чтобы добавить учебный материал в каталог платформы."}
          </p>
        </div>

        {error && <p className="formError">{error}</p>}

        <form className="authForm" onSubmit={handleSubmit}>
          <label>
            Название урока
            <input
              type="text"
              placeholder="Например: Lesson 5: Travel"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>

          <label>
            Уровень
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              required
            >
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
            </select>
          </label>

          <label>
            Описание
            <textarea
              placeholder="Краткое описание урока"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </label>

          <label>
            Слова
            <textarea
              placeholder={"Travel - Путешествие\nTicket - Билет\nHotel - Отель"}
              value={wordsText}
              onChange={(event) => setWordsText(event.target.value)}
              required
            />
          </label>

          <label>
            Вопросы теста
            <textarea
              className="questionsTextarea"
              placeholder={
                "Как переводится Travel?\nПутешествие\nБилет\nОтель\nОтвет: Путешествие\n\nКак переводится Ticket?\nБилет\nОтель\nАэропорт\nОтвет: Билет"
              }
              value={questionsText}
              onChange={(event) => setQuestionsText(event.target.value)}
              required
            />
          </label>

          <button className="primaryButton" type="submit">
            {isEditMode ? "Сохранить изменения" : "Добавить урок"}
          </button>
        </form>
      </div>

      <section className="adminBox usersAdminBox">
        <div className="adminHeader">
          <p className="badge">Пользователи</p>
          <h1>Управление ролями</h1>
          <p>
            Первый зарегистрированный пользователь получает роль администратора.
            Затем администратор может назначать роли остальным пользователям.
          </p>
        </div>

        {roleMessage && <p className="formInfo">{roleMessage}</p>}

        <div className="userRoleList">
          {users.map((user) => (
            <div className="userRoleItem" key={user.id}>
              <div>
                <h3>{user.name}</h3>
                <p>{user.email}</p>
                <span>{user.createdAt}</span>
              </div>

              <select
                value={user.role}
                onChange={(event) => updateUserRole(user.id, event.target.value)}
              >
                <option value="student">Ученик</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Admin;
