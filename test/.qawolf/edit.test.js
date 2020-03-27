console.log('test running', Date.now());

const qawolf = require('qawolf');
// const { TEST_URL } = require('./utils');

const net = require('net');

const client = net.createConnection(
  { port: Number(process.env.EDIT_PORT) },
  () => {
    console.log('CLIENT: I connected to the server.');
    client.write('CLIENT: Hello this is client!');
  },
);

client.on('data', (data) => {
  console.log(data.toString());
  client.end();
});

client.on('end', () => {
  console.log('CLIENT: I disconnected from the server.');
});

let browser;
let page;

beforeAll(async () => {
  browser = await qawolf.launch();
  const context = await browser.newContext();
  await qawolf.register(context);
  page = await context.newPage();
});

afterAll(async () => {
  await qawolf.stopVideos();
  await browser.close();
});

test('edit', async () => {
  console.log('ran test');
});
