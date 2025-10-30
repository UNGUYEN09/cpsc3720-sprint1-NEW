import { useEffect, useState } from 'react';
import './App.css';
import Chatbot from './Chatbot';

function App() {
  const [events, setEvents] = useState([]);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [quantities, setQuantities] = useState({}); // store user-chosen quantities

  // Fetch events from backend
  const fetchEvents = () => {
    fetch('http://localhost:6001/api/llm/events')
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error('Error fetching events:', err));
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

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

    fetch(`http://localhost:6001/api/llm/events/${id}/purchase`, {
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
  );
}

export default App;
