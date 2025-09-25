const http = require('http');
const port = process.env.PORT || 3000;

const html = `<!doctype html><html><head><meta charset="utf-8"><title>My App</title></head>
<body>
  <h1 id="headline">Hello, world</h1>
  <button id="btn">Click me</button>
  <script>
    document.getElementById('btn').addEventListener('click', () => {
      document.getElementById('headline').textContent = 'Clicked!';
    });
  </script>
</body></html>`;

http.createServer((_, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(html);
}).listen(port, () => {
  console.log('Server running on http://localhost:' + port);
});
