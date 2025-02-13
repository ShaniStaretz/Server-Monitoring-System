const request = require('supertest');
const {app,connection} = require('./server');

describe('Express Server Tests', () => {
    afterAll(async () => {
        await connection.end(); // Closes the PostgreSQL connection pool
    });
    it('should return a success message on GET /', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe('Express + PostgreSQL API is running!');
    });

    
});
