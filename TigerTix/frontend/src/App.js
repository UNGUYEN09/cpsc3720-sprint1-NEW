import { useEffect, useState } from 'react';
import './App.css';
import Chatbot from './Chatbot'; // Import the Chatbot component

function App() {
  const [events, setEvents] = useState([]);
  const [purchaseMessage, setPurchaseMessage] = useState('');

  // Fetch events from LLM backend
  const fetchEvents = () => {
    fetch('http://localhost:6001/api/llm/events') // <-- Updated URL
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error('Error fetching events:', err));
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  // Purchase ticket
  const buyTicket = (id, name) => {
    fetch(`http://localhost:6001/api/llm/events/${id}/purchase`, { // <-- Updated URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then(() => {
        setPurchaseMessage(`Successfully purchased ticket for ${name}`);
        fetchEvents(); // refresh immediately after purchase
      })
      .catch(() => setPurchaseMessage('Error purchasing ticket.'));
  };

  return (
    <main>
      <h1>TigerTix Events</h1>

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
                <button
                  onClick={() => buyTicket(event.id, event.name)}
                  aria-label={`Buy ticket for ${event.name}`}
                >
                  Buy Ticket
                </button>
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

      {/* Integrate the Chatbot component */}
      <Chatbot />
    </main>
  );
}

export default App;
