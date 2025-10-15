// frontend/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent page reload
    if (!question.trim()) return; // Don't send empty questions

    setIsLoading(true);
    setAnswer('');

    // Send question to the backend API
    axios.post('http://127.0.0.1:8000/query', { question: question })
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