import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../utils/api";

function Quiz() {
  const { id } = useParams();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLesson() {
      try {
        const data = await apiRequest("/lessons");
        const foundLesson = data.lessons.find((item) => item.id === Number(id));
        setLesson(foundLesson || null);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [id]);

  if (loading) {
    return (
      <main className="page">
        <h1>Загрузка теста...</h1>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="page">
        <h1>Тест не найден</h1>
      </main>
    );
  }

  function selectAnswer(questionIndex, option) {
    setError("");
    setAnswers({
      ...answers,
      [questionIndex]: option,
    });
  }

  async function checkResult() {
    setError("");

    if (lesson.questions.length === 0) {
      setError("В этом уроке пока нет вопросов для теста.");
      return;
    }

    if (Object.keys(answers).length < lesson.questions.length) {
      setError("Ответьте на все вопросы перед проверкой результата.");
      return;
    }

    let score = 0;

    lesson.questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        score++;
      }
    });

    setResult(score);

    const newResult = {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      level: lesson.level,
      score,
      total: lesson.questions.length,
      percent: Math.round((score / lesson.questions.length) * 100),
    };

    try {
      await apiRequest("/results", {
        method: "POST",
        body: JSON.stringify(newResult),
      });
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <main className="page">
      <div className="quizBox">
        <span className="level">{lesson.level}</span>

        <h1>Тест: {lesson.title}</h1>

        <p className="quizDescription">
          Ответьте на вопросы и проверьте, насколько хорошо вы усвоили материал
          урока.
        </p>

        {lesson.questions.map((question, questionIndex) => (
          <div className="questionBox" key={questionIndex}>
            <h3>{question.question}</h3>

            {question.options.map((option) => (
              <button
                type="button"
                key={option}
                className={
                  answers[questionIndex] === option
                    ? "optionButton selectedOption"
                    : "optionButton"
                }
                onClick={() => selectAnswer(questionIndex, option)}
              >
                {option}
              </button>
            ))}
          </div>
        ))}

        {error && <p className="formError">{error}</p>}

        <button className="primaryButton" onClick={checkResult}>
          Проверить результат
        </button>

        {result !== null && (
          <div className="resultBox">
            <h2>
              Результат: {result} из {lesson.questions.length}
            </h2>

            {result === lesson.questions.length ? (
              <p>Отлично! Все ответы правильные.</p>
            ) : (
              <p>
                Хорошая попытка. Можно повторить урок и пройти тест еще раз.
              </p>
            )}

            <Link to="/lessons" className="secondaryButton">
              Вернуться к урокам
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default Quiz;
