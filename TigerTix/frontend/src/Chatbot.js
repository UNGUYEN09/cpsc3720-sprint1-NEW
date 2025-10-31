import React, { useEffect, useRef, useState } from 'react';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    // Voice Interface: Variables // 
    const [ttsOn, setTtsOn] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
        setResponse('');
    };

    // Voice Interface: Converting spoken numbers as words (five) to actual numbers (5) Only supports numbers 1-9 //
    function normalizeNumbers(text) {
        return text
        // Prevents replacing 2 with to, and to with 2, by accounting for tickets being said before
            .replace(/\bfor\b(?=\s+(ticket|tickets|tix)\b)/gi, 'four')
            .replace(/\btoo\b(?=\s+(ticket|tickets|tix)\b)/gi, 'two')
            .replace(/\bto\b(?=\s+(ticket|tickets|tix)\b)/gi, 'two')
        // Just switches the number if its heard for the rest
            .replace(/\bone\b/gi, '1')
            .replace(/\btwo\b/gi, '2')
            .replace(/\bthree\b/gi, '3')
            .replace(/\bfour\b/gi, '4')
            .replace(/\bfive\b/gi, '5')
            .replace(/\bsix\b/gi, '6')
            .replace(/\bseven\b/gi, '7')
            .replace(/\beight\b/gi, '8')
            .replace(/\bnine\b/gi, '9');
    }

    // Voice Interface: Beep sound function // 
    const beep = async (duration = 200, frequency = 900) => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const beepSound = audioContext.createOscillator();
            const gain = audioContext.createGain();
            beepSound.frequency.value = frequency;
            beepSound.connect(gain);
            gain.connect(audioContext.destination);
            gain.gain.setValueAtTime(0.2, audioContext.currentTime);
            beepSound.start();
            await new Promise(r => setTimeout(r, duration));
            beepSound.stop();
            await audioContext.close();
        } catch (_) { }
    };

    //  Voice Interface: Records user voice and converts it to text //
    const startRecording = async () => {
        if (isRecording) return;

        await beep();
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SR();
        recognitionRef.current = recognition;

        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.continuous = false;

        setIsRecording(true);

        recognition.onresult = (speechEvent) => {
            const transcript = Array.from(speechEvent.results)
                .map(r => r[0]?.transcript || '')
                .join(' ')
                .trim();
            setUserInput(normalizeNumbers(transcript));
        };

        recognition.onerror = () => {
            setResponse('Sorry, I couldn’t hear that. Try again closer to the mic.');
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        try {
            recognition.start();
        } catch {
            setIsRecording(false);
        }
    };

    // Voice Interface: Stops recording when user releases button press // 
    const stopRecording = () => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { }
        }
    };

    // Voice Interface: Speech synthesizer //
    const speak = (text) => {
        if (!ttsOn || !text) return;
        try {
            window.speechSynthesis.cancel();
            const speech = new SpeechSynthesisUtterance(text);
            speech.rate = 0.95;
            speech.pitch = 1.0;
            speech.volume = 1.0;
            window.speechSynthesis.speak(speech);
        } catch { }
    };

    const sendRequest = async () => {
        const trimmed = userInput.trim();
        if (!trimmed) return;

        setLoading(true);
        setResponse('');

        try {
            const cleanedInput = normalizeNumbers(trimmed);
            const parseResponse = await fetch('http://localhost:6001/api/llm/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: cleanedInput }),
            });

            const parseData = await parseResponse.json();

            if (!parseResponse.ok) {
                const msg = parseData.error || 'Error parsing input.';
                setResponse(msg);
                speak(msg);
                setLoading(false);
                return;
            }

            const proposed = `I can book ${parseData.tickets} tickets for “${parseData.event}”. To confirm, please choose yes or no`;
            setResponse(proposed);
            speak(proposed);

            const confirmation = window.confirm(
                `Confirm booking ${parseData.tickets} ticket(s) for ${parseData.event}?`
            );

            if (confirmation) {
                const confirmResponse = await fetch('http://localhost:6001/api/llm/confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event: parseData.event, tickets: parseData.tickets }),
                });

                const confirmData = await confirmResponse.json();
                const msg = confirmData.message || 'Booking completed.';
                setResponse(msg);
                speak(msg);
            } else {
                setResponse('Booking canceled.');
                speak('Booking canceled.');
            }
        } catch (err) {
            const msg = 'Error communicating with LLM service: ' + err.message;
            setResponse(msg);
            speak(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            try { window.speechSynthesis.cancel(); } catch { }
        }
    }, [isOpen]);

    return (
        <div className="chatbot">
            <button className="chatbot-toggle" onClick={toggleChatbot}>
                {isOpen ? 'Close' : 'Chat'}
            </button>

            {isOpen && (
                <div className="chatbot-window" role="dialog" aria-label="TigerTix voice chatbot">
                    <h3>Chatbot</h3>

                    <div className="input-row">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(speechEvent) => setUserInput(speechEvent.target.value)}
                            placeholder="Type or use the mic…"
                            aria-label="Chat input"
                        />

                        <button
                            className={`mic-btn ${isRecording ? 'recording' : ''}`}
                            onClick={() => {
                                if (isRecording) stopRecording();
                                else startRecording();
                            }}
                            aria-label={isRecording ? 'Recording… release to stop' : 'Hold to speak'}
                            title="Hold to speak"
                        >
                            Press to Speak
                        </button>
                    </div>

                    <div className="controls-row">
                        <label className="tts-toggle">
                            <input
                                type="checkbox"
                                checked={ttsOn}
                                onChange={(speechEvent) => setTtsOn(speechEvent.target.checked)}
                            />
                            Speak responses
                        </label>

                        <button onClick={sendRequest} disabled={loading} className="send-btn">
                            {loading ? 'Sending…' : 'Send'}
                        </button>
                    </div>

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
