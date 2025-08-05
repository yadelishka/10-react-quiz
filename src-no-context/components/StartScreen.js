function StartScreen({ numQuestions, dispatch }) {
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
        >
          Let's start
        </button>
      </div>
    </div>
  );
}

export default StartScreen;
