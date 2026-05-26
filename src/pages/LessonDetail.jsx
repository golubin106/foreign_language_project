import { Link, useParams } from "react-router-dom";
import { getLessons } from "../data/getLessons";

function LessonDetail() {
  const { id } = useParams();
  const lessons = getLessons();
  const lesson = lessons.find((item) => item.id === Number(id));

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
