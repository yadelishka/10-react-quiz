import { useEffect, useReducer } from "react";
import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishScreen from "./FinishScreen";
import Footer from "./Footer";
import Timer from "./Timer";

const SECS_PER_QUESTION = 30;

const POINTS_PER_DIFFICULTY = {
  junior: 10,
  middle: 20,
  senior: 30,
};

const initialState = {
  questions: [],
  filteredQuestions: [],

  // 'loading', 'error', 'ready', 'active', 'finished'
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: null,
  difficulty: "junior",
  numQuestions: 0,
  answers: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "dataRecieved":
      const filtered = action.payload.filter(
        (question) =>
          question.points === POINTS_PER_DIFFICULTY[state.difficulty]
      );
      return {
        ...state,
        questions: action.payload,
        filteredQuestions: filtered,
        numQuestions: filtered.length,
        status: "ready",
      };
    case "dataFailed":
      return { ...state, status: "error" };
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.filteredQuestions.length * SECS_PER_QUESTION,
        questions: state.filteredQuestions.sort(() => Math.random() - 0.5),
        index: 0,
        answer: null,
        points: 0,
      };
    case "newAnswer":
      const question = state.questions.at(state.index);

      const newAnswers = [...state.answers];

      newAnswers[state.index] = action.payload;

      const isCorrect = action.payload === question.correctAnswer;

      return {
        ...state,
        answers: newAnswers,
        answer: action.payload,
        points: isCorrect ? state.points + question.points : state.points,
      };
    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };
    case "finish":
      return {
        ...state,
        status: "finished",
        highscore:
          state.points > state.highscore ? state.points : state.highscore,
      };
    case "restart":
      return { ...initialState, questions: state.questions, status: "ready" };
    // return {
    //   ...state,
    //   poimts: 0,
    //   highscore: 0,
    //   index: 0,
    //   answer: null,
    //   status: "ready",
    // };
    case "tick":
      return {
        ...state,
        secondsRemaining: action.payload,
        status: action.payload === 0 ? "finished" : state.status,
      };
    case "chooseDifficulty":
      const filteredQuestions = state.questions.filter(
        (q) => q.points === POINTS_PER_DIFFICULTY[action.payload]
      );
      return {
        ...state,
        difficulty: action.payload,
        filteredQuestions,
        numQuestions: filteredQuestions.length,
      };
    default:
      throw new Error("Action unknown");
  }
}

export default function App() {
  const [
    {
      questions,
      status,
      index,
      answer,
      points,
      highscore,
      secondsRemaining,
      numQuestions,
      filteredQuestions,
      difficulty,
      answers,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  const maxPossiblePoints = filteredQuestions.reduce(
    (prev, cur) => prev + cur.points,
    0
  );

  useEffect(function () {
    fetch("http://localhost:8000/questions")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataRecieved", payload: data }))
      .catch((err) => dispatch({ type: "dataFailed" }));
  }, []);

  return (
    <div className="app">
      <Header />

      <Main className="main">
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === "active" && (
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              maxPossiblePoints={maxPossiblePoints}
              answer={answer}
            />
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
              answers={answers}
              currentIndex={index}
            />
            <Footer>
              <Timer initialSeconds={secondsRemaining} dispatch={dispatch} />
              <NextButton
                dispatch={dispatch}
                answer={answer}
                numQuestions={numQuestions}
                index={index}
              />
            </Footer>
          </>
        )}
        {status === "finished" && (
          <FinishScreen
            points={points}
            maxPossiblePoints={maxPossiblePoints}
            highscore={highscore}
            dispatch={dispatch}
            difficulty={difficulty}
          />
        )}
      </Main>
    </div>
  );
}
