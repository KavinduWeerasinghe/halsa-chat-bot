// frontend/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// 1. Get the API URL from the environment variable
const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer('');

    // 2. Use the API_URL variable here.
    //    Note: The endpoint in your code is '/query'. Make sure this matches your backend.
    axios.post(`${API_URL}/query`, { question: question })
      .then(response => {
        if (response.data.answer) {
          setAnswer(response.data.answer);
        } else {
          setAnswer('Sorry, there was an error processing your question.');
        }
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
      </header>
    </div>
  );
}

export default App;