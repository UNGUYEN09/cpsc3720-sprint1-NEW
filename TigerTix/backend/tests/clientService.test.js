const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../client-service/server');
const setupDB = require('../client-service/setup');

const dbPath = path.resolve(__dirname, '../shared-db/database.sqlite');

beforeEach(async () => {
  // Re-initialize the database
  await setupDB();
});

describe('Client Service - Ticket Booking', () => {
  test('GET /events should list events', async () => {
    const response = await request(app).get('/api/events');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('POST /events/:id/purchase should successfully book tickets', async () => {
    const response = await request(app)
      .post('/api/events/1/purchase')
      .send({ quantity: 2 });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('updatedEvent');
    expect(response.body.updatedEvent.ticketsAvailable).toBeGreaterThanOrEqual(0);
  });

  test('POST /events/:id/purchase should fail for invalid event ID', async () => {
    const response = await request(app)
      .post('/api/events/9999/purchase')
      .send({ quantity: 2 });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error');
  });

  test('POST /events/:id/purchase should fail for invalid quantity', async () => {
    const response = await request(app)
      .post('/api/events/1/purchase')
      .send({ quantity: 0 });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('POST /events/:id/purchase should fail if not enough tickets', async () => {
    const response = await request(app)
      .post('/api/events/1/purchase')
      .send({ quantity: 1000 });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Not enough tickets');
  });
});
