import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="hero">
      <div className="heroContent">
        <p className="badge">Дипломный проект</p>

        <h1>Платформа для изучения иностранного языка</h1>

        <p className="subtitle">
          Интерактивная система для изучения английского языка с уроками,
          словарными карточками, тестами и отслеживанием прогресса.
        </p>

        <div className="heroButtons">
          <Link to="/lessons/1" className="primaryButton">
            Начать обучение
          </Link>

          <Link to="/lessons" className="secondaryButton">
            Посмотреть уроки
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Home;
