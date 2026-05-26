import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../utils/api";

function LessonDetail() {
  const { id } = useParams();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
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
        <h1>Загрузка урока...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <p className="formError">{error}</p>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="page">
        <h1>Урок не найден</h1>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="lessonDetail">
        <span className="level">{lesson.level}</span>

        <h1>{lesson.title}</h1>
        <p>{lesson.description}</p>

        <h2>Новые слова</h2>

        <div className="wordList">
          {lesson.words.map((word, index) => (
            <div className="wordItem" key={index}>
              <strong>{word.english}</strong>
              <span>{word.russian}</span>
            </div>
          ))}
        </div>

        <Link to={`/quiz/${lesson.id}`} className="primaryButton">
          Перейти к тесту
        </Link>
      </div>
    </main>
  );
}

export default LessonDetail;
