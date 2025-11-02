const request = require('supertest');
const app = require('../admin-service/server');
const setupDB = require('../admin-service/setup');

beforeAll(async () => {
  await setupDB(); // ensure DB tables and default event exist
});

describe('Admin Service - Event Management', () => {
  let createdEventId;

  test('POST /api/admin/events should create a new event', async () => {
    const newEvent = { name: 'New Test Event', date: '2025-12-02', ticketsAvailable: 50 };
    const response = await request(app).post('/api/admin/events').send(newEvent);

    expect(response.statusCode).toBe(201);
    // Admin controller returns { message, event }
    expect(response.body).toHaveProperty('event');
    expect(response.body.event).toHaveProperty('id');
    expect(response.body.event.name).toBe(newEvent.name);

    createdEventId = response.body.event.id;
  });

  test('GET /api/admin/events should retrieve list of events', async () => {
    const response = await request(app).get('/api/admin/events');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
