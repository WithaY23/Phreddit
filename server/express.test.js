/**
 * @jest-environment node
 */


const axios = require('axios');


test('Get request to port 8000', async() =>
{

        const port = 8000;
        const message = await axios.get(`http://localhost:${port}/`);
        expect(message.data).toBe("Hello Phreddit! Get request received at localhost:8000");


    
})