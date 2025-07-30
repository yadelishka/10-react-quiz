import { useState, useEffect } from "react";

function Options({ question, dispatch, answer }) {
  const hasAnswered = answer !== null;
  const [shuffledOptions, setShuffledOptions] = useState([]);

  useEffect(() => {
    setShuffledOptions([...question.options].sort(() => Math.random() - 0.5));
  }, [question]);

  return (
    <div className="options">
      {shuffledOptions.map((option, index) => (
        <button
          className={`btn btn-option ${answer === option ? "answer" : ""}
${
  hasAnswered ? (option === question.correctAnswer ? "correct" : "wrong") : ""
}`}
          key={option}
          disabled={hasAnswered}
          onClick={() => dispatch({ type: "newAnswer", payload: option })}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default Options;
