import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [purchaseMessage, setPurchaseMessage] = useState('');

  /*
  fetchEvents()
  PURPOSE: Fetches event data by making a call to client-service.
  INPUTS: n/a
  OUTPUTS: n/a
  */
  const fetchEvents = () => {
    fetch('http://localhost:6001/api/events')
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error('Error fetching events:', err));
  };

  /*
  useEffect()
  PURPOSE: Initalizes events and refreshes events.
  INPUTS: n/a
  OUTPUTS: n/a
  */
  useEffect(() => {
    // Initial fetch
    fetchEvents();

    // Set up polling every 5 seconds
    const interval = setInterval(fetchEvents, 5000);

    // Cleanup on component unmount
    return () => clearInterval(interval);
  }, []);

  /*
  buyTicket(id, name)
  PURPOSE: Decrements total number of tickets for a specific event by 1 by calling client-service.
  INPUTS: int id - Event ID, string name - User name
  OUTPUTS: n/a
  */
  const buyTicket = (id, name) => {
    fetch(`http://localhost:6001/api/events/${id}/purchase`, {
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
    </main>
  );
}

export default App;
