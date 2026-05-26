import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLessons } from "../data/getLessons";

function Quiz() {
  const { id } = useParams();
  const lessons = getLessons();
  const lesson = lessons.find((item) => item.id === Number(id));

  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  if (!lesson) {
    return (
      <main className="page">
        <h1>Тест не найден</h1>
      </main>
    );
  }

  function selectAnswer(questionIndex, option) {
    setAnswers({
      ...answers,
      [questionIndex]: option,
    });
  }

  function checkResult() {
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
      completedAt: new Date().toLocaleString(),
    };

    const savedResults = JSON.parse(localStorage.getItem("quizResults")) || [];

    const filteredResults = savedResults.filter(
      (item) => item.lessonId !== lesson.id
    );

    const updatedResults = [...filteredResults, newResult];

    localStorage.setItem("quizResults", JSON.stringify(updatedResults));
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
