const axios = require('axios');



test('Get request to port 8000', async() =>
{
    try
    {
        const port = 8000;
        const message = await axios.get(`http://localhost:${port}/`);
        expect(message.data).toBe("Hello Phreddit! Get request received at localhost:8000");
    }
    catch
    {
        expect(1).toBe(2); //failed the get request, auto fail
    }
    
})