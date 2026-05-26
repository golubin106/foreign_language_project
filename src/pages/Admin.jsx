import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../utils/api";

function Admin() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editId = id ? Number(id) : null;
  const isEditMode = Boolean(editId);

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("A1");
  const [description, setDescription] = useState("");
  const [wordsText, setWordsText] = useState("");
  const [question, setQuestion] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

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
        setQuestion(lesson.questions[0]?.question || "");
        setOptionsText(lesson.questions[0]?.options.join("\n") || "");
        setAnswer(lesson.questions[0]?.answer || "");
      } catch (error) {
        setError(error.message);
      }
    }

    loadLesson();
  }, [editId, isEditMode, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedQuestion = question.trim();
    const trimmedAnswer = answer.trim();

    if (!trimmedTitle || !trimmedDescription || !trimmedQuestion) {
      setError("Заполните название, описание и вопрос теста.");
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

    const options = optionsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const uniqueOptions = [...new Set(options)];

    if (uniqueOptions.length < 2) {
      setError("Добавьте минимум два разных варианта ответа.");
      return;
    }

    if (!uniqueOptions.includes(trimmedAnswer)) {
      setError("Правильный ответ должен совпадать с одним из вариантов ответа.");
      return;
    }

    const lesson = {
      id: isEditMode ? editId : Date.now(),
      title: trimmedTitle,
      level,
      description: trimmedDescription,
      words,
      questions: [
        {
          question: trimmedQuestion,
          options: uniqueOptions,
          answer: trimmedAnswer,
        },
      ],
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

  return (
    <main className="page">
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
            Вопрос теста
            <input
              type="text"
              placeholder="Как переводится Travel?"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              required
            />
          </label>

          <label>
            Варианты ответа
            <textarea
              placeholder={"Путешествие\nБилет\nОтель\nАэропорт"}
              value={optionsText}
              onChange={(event) => setOptionsText(event.target.value)}
              required
            />
          </label>

          <label>
            Правильный ответ
            <input
              type="text"
              placeholder="Путешествие"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              required
            />
          </label>

          <button className="primaryButton" type="submit">
            {isEditMode ? "Сохранить изменения" : "Добавить урок"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default Admin;
