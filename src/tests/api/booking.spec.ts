import { test, expect } from '@playwright/test';

test.describe('Booking API', () => {
    const baseUrl = 'https://automationintesting.online';
    let rooms: any;
    let roomId: number;
    let token: any;

    test('[GET] rooms', async ({ request }) => {
        const response = await request.get(`${baseUrl}/room/`);
        rooms = await response.json();
        expect(response.status()).toBe(200);
        roomId = rooms.rooms[0].roomid;
    });

    test('The response is not empty', async () => {
        console.log(rooms);
        expect(rooms.rooms.length).toBeGreaterThan(0);
        expect(rooms.rooms[0]).toHaveProperty('roomName');
        expect(roomId).not.toBe(null);
        console.log(`Room ID: ${roomId}`)
    });

    test('[POST] get access token', async ({ request }) => {
        const response = await request.post(`${baseUrl}/auth/login`, {
            data: {
                "username": "admin",
                "password": "password"
            }
        });
        const header = await response.headers();
        token = header['set-cookie'].split(';')[0];
        console.table(`Token: ${token}`);
    });

    test('[GET] booking the room', async ({ request }) => {
        const response = await request.post(`${baseUrl}/booking/`, {
            data: {
                "bookingdates": {
                    "checkin": "2019-11-01T09:48:25.469Z",
                    "checkout": "2019-11-02T09:48:25.469Z"
                  },
                  "depositpaid": true,
                  "firstname": "Any",
                  "lastname": "Name",
                  "roomid": roomId,
                  "totalprice": 1
            }
        });
        expect(response.status()).toBe(201);
    });
});

