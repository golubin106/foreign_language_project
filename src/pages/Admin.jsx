import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLessons } from "../data/getLessons";
import { defaultLessons } from "../data/lessons";

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

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const lesson = getLessons().find((item) => item.id === editId);

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
  }, [editId, isEditMode, navigate]);

  function handleSubmit(event) {
    event.preventDefault();

    const words = wordsText
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const [english, russian] = line.split(/\s*[-—]\s*/);

        return {
          english: english ? english.trim() : "",
          russian: russian ? russian.trim() : "",
        };
      });

    const hasIncorrectWords = words.some(
      (word) => word.english === "" || word.russian === ""
    );

    if (hasIncorrectWords) {
      alert("Проверьте поле 'Слова'. Формат должен быть: English - Русский перевод");
      return;
    }

    const options = optionsText
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => line.trim());

    if (!options.includes(answer)) {
      alert("Правильный ответ должен совпадать с одним из вариантов ответа.");
      return;
    }

    const newLesson = {
      id: isEditMode ? editId : Date.now(),
      title,
      level,
      description,
      words,
      questions: [
        {
          question,
          options,
          answer,
        },
      ],
    };

    if (isEditMode) {
      const isDefaultLesson = defaultLessons.some(
        (lesson) => lesson.id === editId
      );

      if (isDefaultLesson) {
        const editedLessons =
          JSON.parse(localStorage.getItem("editedLessons")) || [];

        const updatedEditedLessons = [
          ...editedLessons.filter((lesson) => lesson.id !== editId),
          newLesson,
        ];

        localStorage.setItem(
          "editedLessons",
          JSON.stringify(updatedEditedLessons)
        );
      } else {
        const savedCustomLessons =
          JSON.parse(localStorage.getItem("customLessons")) || [];

        const updatedCustomLessons = savedCustomLessons.map((lesson) =>
          lesson.id === editId ? newLesson : lesson
        );

        localStorage.setItem(
          "customLessons",
          JSON.stringify(updatedCustomLessons)
        );
      }
    } else {
      const savedCustomLessons =
        JSON.parse(localStorage.getItem("customLessons")) || [];

      localStorage.setItem(
        "customLessons",
        JSON.stringify([...savedCustomLessons, newLesson])
      );
    }

    navigate("/lessons");
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
