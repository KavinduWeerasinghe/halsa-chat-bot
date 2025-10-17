// frontend/src/App.js
import React, { useState } from 'react';
// We no longer need axios for this component
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New state for streaming-specific timing
  const [timeToFirstToken, setTimeToFirstToken] = useState(null);
  const [totalTime, setTotalTime] = useState(null);

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer('');
    setTimeToFirstToken(null);
    setTotalTime(null);

    const startTime = performance.now();
    let firstTokenTime = null;

    try {
      const response = await fetch(`${API_URL}/query-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Stream finished
          const endTime = performance.now();
          setTotalTime((endTime - startTime) / 1000); // in seconds
          break;
        }

        // Measure time to first token
        if (firstTokenTime === null) {
            firstTokenTime = performance.now();
            setTimeToFirstToken((firstTokenTime - startTime) / 1000); // in seconds
        }

        const chunk = decoder.decode(value);

        console.log("Received chunk:", chunk);

        setAnswer((prevAnswer) => prevAnswer + chunk);
      }

    } catch (error) {
      console.error("Streaming failed:", error);
      setAnswer('Failed to connect to the backend streamer. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Hälsa Document Chatbot</h1>
        <form onSubmit={handleSubmit} className="chat-form">
          <input
            type="text"
            value={question}
            onChange={handleQuestionChange}
            placeholder="Ask something about the documents..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Thinking...' : 'Ask'}
          </button>
        </form>

        {answer && (
          <div className="answer-container">
            <p>{answer}</p>
          </div>
        )}

        {/* Render the new timing data */}
        {totalTime !== null && (
          <div className="stats-container">
            <p><strong>Time to First Token:</strong> {timeToFirstToken.toFixed(2)}s</p>
            <p><strong>Total Generation Time:</strong> {totalTime.toFixed(2)}s</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;