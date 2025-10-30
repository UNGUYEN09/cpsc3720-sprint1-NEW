// llmService.js
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';

/**
 * parseInput()
 * PURPOSE: Sends a prompt to the local Ollama service and extracts the event name + ticket count
 */
async function parseInput(userInput) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20s safety timeout

  try {
    const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'llama3',
        prompt: `Extract the event name and number of tickets from this user request.
Reply ONLY as a JSON object with keys "event" (string) and "tickets" (integer).
User request: "${userInput}"`,
        stream: false,   // ensure full response, not stream
        format: 'json'   // request JSON format
      })
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Ollama HTTP ${resp.status}: ${text}`);
    }

    const data = await resp.json(); // { response: '...json string...' }
    const raw = typeof data.response === 'string' ? data.response.trim() : '';
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Model did not return JSON: ' + raw);
    }

    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    parsed.tickets = Number.isInteger(parsed.tickets) ? parsed.tickets : 1;
    if (!parsed.event || typeof parsed.event !== 'string') {
      throw new Error('Missing "event" in model JSON: ' + raw);
    }

    return parsed;
  } catch (err) {
    throw new Error('parseInput failed: ' + err.message);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * bookTickets()
 * PURPOSE: Mock function that simulates booking tickets.
 * You can replace this later with database logic or real booking API calls.
 */
function bookTickets(event, tickets) {
  console.log(`Booking ${tickets} tickets for event: ${event}`);
  // Mock response
  return {
    success: true,
    message: `Successfully booked ${tickets} ticket(s) for ${event}.`
  };
}

module.exports = { parseInput, bookTickets };
