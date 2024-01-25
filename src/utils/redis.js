import redis from 'redis';

const client = redis.createClient();
client.on('connect', (err) => console.log('redis connection!!!'));
client.connect();
export { client };
