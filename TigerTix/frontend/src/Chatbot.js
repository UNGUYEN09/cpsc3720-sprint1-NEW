import React, { useState } from 'react';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
        setResponse('');
    };

    const sendRequest = async () => {
        if (!userInput.trim()) return;

        setLoading(true);
        setResponse('');

        try {
            const parseResponse = await fetch('http://localhost:6001/api/llm/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userInput }),
            });

            const parseData = await parseResponse.json();

            if (!parseResponse.ok) {
                setResponse(parseData.error || 'Error parsing input.');
                setLoading(false);
                return;
            }

            const confirmation = window.confirm(
                `Do you want to book ${parseData.tickets} ticket(s) for ${parseData.event}?`
            );

            if (confirmation) {
                const confirmResponse = await fetch('http://localhost:6001/api/llm/confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event: parseData.event, tickets: parseData.tickets }),
                });

                const confirmData = await confirmResponse.json();
                setResponse(confirmData.message || 'Booking completed.');
            } else {
                setResponse('Booking canceled.');
            }
        } catch (err) {
            console.error(err);
            setResponse('Error communicating with Llama 3: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chatbot">
            <button className="chatbot-toggle" onClick={toggleChatbot}>
                {isOpen ? 'Close' : 'Chat'}
            </button>
            {isOpen && (
                <div className="chatbot-window">
                    <h3>Chatbot</h3>
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your booking request..."
                    />
                    <button onClick={sendRequest} disabled={loading}>
                        Send
                    </button>
                    <div className="chatbot-response" aria-live="polite">
                        {loading ? (
                            <>
                                <span className="spinner"></span> Waiting for response...
                            </>
                        ) : (
                            response
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
