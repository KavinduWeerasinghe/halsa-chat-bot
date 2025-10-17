// frontend/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1. Add state for timing data
  const [totalTime, setTotalTime] = useState(null);
  const [apiTime, setApiTime] = useState(null);
  const [networkLag, setNetworkLag] = useState(null);

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    // Clear previous results
    setAnswer('');
    setTotalTime(null);
    setApiTime(null);
    setNetworkLag(null);

    // 2. Start the timer for the total request
    const startTime = performance.now();

    axios.post(`${API_URL}/query`, { question: question })
      .then(response => {
        // 3. Calculate all times when the response is received
        const endTime = performance.now();
        const totalDuration = (endTime - startTime) / 1000; // in seconds
        const apiDuration = response.data.processing_time;
        const lag = totalDuration - apiDuration;

        // 4. Update state with the answer and timing data
        setAnswer(response.data.answer);
        setTotalTime(totalDuration);
        setApiTime(apiDuration);
        setNetworkLag(lag);
      })
      .catch(error => {
        console.error("API call failed:", error);
        setAnswer('Failed to connect to the backend. Is the server running?');
      })
      .finally(() => {
        setIsLoading(false);
      });
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

        {/* 5. Render the timing data if it exists */}
        {totalTime !== null && (
          <div className="stats-container">
            <p><strong>Total Response:</strong> {totalTime.toFixed(2)}s</p>
            <p><strong>API Processing:</strong> {apiTime.toFixed(2)}s</p>
            <p><strong>Network Latency:</strong> {networkLag.toFixed(2)}s</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;