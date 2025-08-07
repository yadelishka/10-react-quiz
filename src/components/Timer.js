import { useState, useEffect } from "react";
import { useQuiz } from "../contexts/QuizContext";

function Timer() {
  const { secondsRemaining: initialSecondsFromContext, dispatch } = useQuiz();
  const [secondsRemaining, setSecondsRemaining] = useState(
    initialSecondsFromContext
  );

  useEffect(() => {
    setSecondsRemaining(initialSecondsFromContext);
  }, [initialSecondsFromContext]);

  useEffect(() => {
    if (secondsRemaining === null) return;

    if (secondsRemaining <= 0) {
      dispatch({ type: "tick", payload: 0 });
      return;
    }

    const timerId = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          dispatch({ type: "tick", payload: 0 });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [dispatch, secondsRemaining]);

  const mins = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <div className="finishTimer">
      {mins < 10 && "0"}
      {mins}:{seconds < 10 && "0"}
      {seconds}
    </div>
  );
}

export default Timer;
