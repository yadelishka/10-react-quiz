import { useEffect, useRef, useState } from "react";
import { useQuiz } from "../contexts/QuizContext";

function StartScreen() {
  const buttonRef = useRef();
  const [test, setTest] = useState("test");
  console.log(buttonRef.current);

  useEffect(function () {
    console.log(buttonRef.current.getBoundingClientRect());
  }, []);

  const { numQuestions, dispatch } = useQuiz();
  return (
    <div className="start">
      <h2>Welcome to The React Quiz!</h2>
      <h3>{numQuestions} questions to test your React mastery</h3>
      <div style={{ display: "flex", gap: 10 }}>
        <select
          className="btn btn-ui"
          onChange={(e) => {
            dispatch({ type: "chooseDifficulty", payload: e.target.value });
            console.log(e);
          }}
        >
          <option value="junior">Junior</option>
          <option value="middle">Middle</option>
          <option value="senior">Senior</option>
        </select>
        <button
          className="btn btn-ui"
          onClick={() => dispatch({ type: "start" })}
          ref={buttonRef}
        >
          Let's start
        </button>
        {/* <button className="btn btn-ui" onClick={() => setTest("clicked")}>
          Let's start
        </button> */}
      </div>
    </div>
  );
}

export default StartScreen;
