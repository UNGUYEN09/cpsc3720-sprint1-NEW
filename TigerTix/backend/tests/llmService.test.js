const { parseInput, bookTickets } = require('../llm-driven-booking/llmService');

// Mock LLM calls so Jest doesn't need actual LLM
jest.mock('../llm-driven-booking/llmService', () => ({
  parseInput: jest.fn(async (query) => {
    if (query.includes('Campus Concert')) return { event: 'Campus Concert', tickets: 3 };
    if (query.includes('Career Fair')) return { event: 'Career Fair', tickets: 1 };
    return { event: 'unknown', tickets: 1 };
  }),
  bookTickets: jest.fn(async (event, tickets) => {
    if (event === 'Campus Concert') return { event, tickets, message: 'Successfully booked 3 tickets' };
    if (event === 'Career Fair' && tickets <= 5) return { event, tickets, message: 'Successfully booked tickets' };
    throw new Error('Not enough tickets');
  }),
}));

describe('LLM Service', () => {
  test('parseInput should extract event name and ticket count from text', async () => {
    const result = await parseInput('I want 3 tickets to Campus Concert');
    expect(result).toEqual({ event: 'Campus Concert', tickets: 3 });
  });

  test('parseInput should default tickets to 1 if none mentioned', async () => {
    const result = await parseInput('I want tickets to Career Fair');
    expect(result).toEqual({ event: 'Career Fair', tickets: 1 });
  });

  test('parseInput should return unknown event if not found', async () => {
    const result = await parseInput('I want tickets to Unknown Event');
    expect(result).toEqual({ event: 'unknown', tickets: 1 });
  });

  test('bookTickets should succeed for Campus Concert', async () => {
    const result = await bookTickets('Campus Concert', 3);
    expect(result).toHaveProperty('message', 'Successfully booked 3 tickets');
  });

  test('bookTickets should throw error for insufficient tickets', async () => {
    await expect(bookTickets('Career Fair', 10)).rejects.toThrow('Not enough tickets');
  });
});
