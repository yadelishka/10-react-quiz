import { createContext, useContext, useEffect, useReducer } from "react";

const QuizContext = createContext();

const POINTS_PER_DIFFICULTY = {
  junior: 10,
  middle: 20,
  senior: 30,
};

const SECS_PER_QUESTION = 30;

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
  initialQuestions: [],
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
        initialQuestions: action.payload,
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
        answers: [],
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
      const filteredOnRestart = state.initialQuestions.filter(
        (question) =>
          question.points === POINTS_PER_DIFFICULTY[initialState.difficulty]
      );

      return {
        ...initialState,
        initialQuestions: state.initialQuestions,
        questions: state.initialQuestions,
        filteredQuestions: filteredOnRestart,
        numQuestions: filteredOnRestart.length,
        difficulty: initialState.difficulty,
        highscore: state.highscore,
        status: "ready",
      };
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

function QuizProvider({ children }) {
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
    <QuizContext.Provider
      value={{
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
        maxPossiblePoints,

        dispatch,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined)
    throw new Error("Quiz context was used outside the QuizProvider");
  return context;
}

export { QuizProvider, useQuiz };
