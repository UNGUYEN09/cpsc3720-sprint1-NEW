import React, { useState, useEffect, useContext } from 'react';
import './App.css';
import Chatbot from './Chatbot';
import { AuthContext } from './auth/AuthContext';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import { Routes, Route, Navigate } from 'react-router-dom';

const CLIENT_API_BASE =
  process.env.REACT_APP_CLIENT_API_URL || 'http://localhost:6001';

function App() {
  const { user, logout, loading } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [quantities, setQuantities] = useState({}); // store user-chosen quantities

  // Fetch events from backend
  const fetchEvents = () => {
    fetch(`${CLIENT_API_BASE}/api/llm/events`)
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error('Error fetching events:', err));
  };

  useEffect(() => {
    if (user) fetchEvents(); // only fetch if logged in
    const interval = setInterval(() => {
      if (user) fetchEvents();
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Update quantity input
  const handleQuantityChange = (eventId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [eventId]: Math.max(1, Number(value)) // at least 1
    }));
  };

  // Purchase tickets
  const buyTicket = (id, name) => {
    const quantity = quantities[id] || 1; // default to 1 if not set

    fetch(`${CLIENT_API_BASE}/api/llm/events/${id}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setPurchaseMessage(`Error: ${data.error}`);
        } else {
          setPurchaseMessage(data.message);
        }
        fetchEvents(); // refresh events after purchase
      })
      .catch(() => setPurchaseMessage('Error purchasing tickets.'));
  };

  // If user is loading session
  if (loading) return <p>Loading user session...</p>;

  // Routes
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" />
          ) : (
            <main>
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>TigerTix Events</h1>
                {user && (
                  <div>
                    <span style={{ marginRight: '10px' }}>Logged in as {user.email}</span>
                    <button onClick={logout}>Logout</button>
                  </div>
                )}
              </header>

              <div aria-live="polite">
                {purchaseMessage && <p>{purchaseMessage}</p>}
              </div>

              {events.length === 0 ? (
                <p>No events available</p>
              ) : (
                <ul className="event-grid">
                  {events.map((event) => (
                    <li key={event.id} className="event-card">
                      <h2>{event.name}</h2>
                      <p>Date: {event.date}</p>
                      <p>Tickets: {event.ticketsAvailable}</p>

                      {event.ticketsAvailable > 0 ? (
                        <>
                          <input
                            type="number"
                            min="1"
                            max={event.ticketsAvailable}
                            value={quantities[event.id] || 1}
                            onChange={(e) => handleQuantityChange(event.id, e.target.value)}
                            aria-label={`Quantity for ${event.name}`}
                            style={{ width: '60px', marginRight: '8px' }}
                          />
                          <button
                            onClick={() => buyTicket(event.id, event.name)}
                            aria-label={`Buy ticket for ${event.name}`}
                          >
                            Buy Ticket
                          </button>
                        </>
                      ) : (
                        <button
                          disabled
                          aria-label={`${event.name} is sold out`}
                          style={{ backgroundColor: '#95a5a6', cursor: 'not-allowed' }}
                        >
                          Sold Out
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {/* Chatbot */}
              <Chatbot />
            </main>
          )
        }
      />
    </Routes>
  );
}

export default App;
