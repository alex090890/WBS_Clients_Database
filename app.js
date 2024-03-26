const express = require('express');
const app = express();
const path = require('path');
const clients = require('./Client');
let id = 0;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

//Create the root path
app.get('/', (req, res) => {
  res.send(`<form action="/login" method="post">
  <label for="login">Username:</label><br>
  <input type="text" id="login" name="login"><br>
  <label for="password">Password:</label><br>
  <input type="password" id="password" name="password"><br>
  <input type="submit" value="Submit">
  </form>`)
})

app.post('/login', (req, res) => {
  const { login, password } = req.body;
  if (login === 'alexprof' && password === 'ilya2003') {
    res.redirect('/clientslist');
  } else {
    res.status(401).send(`
  <h1>Error: Invalid username or password.</h1>
  <button style="background-color: green; color: white;" onclick="location.href='/'">Return to the login page</button>
`);
  }
});

//Display the list of clients in the JSON format
app.get('/clients', (req, res) => {
  res.json(clients);
})

//Display the list of clients in the HTML format
app.get('/clientslist', (req, res) => {
  let html = clients.map(client => {
    return `<li>${client.name}, ${client.email}, ${client.city}</li>`;
  }).join('');
  res.send(html);
});

//Display the list of clients in the HTML format according to the clients's id
app.get('/clients/:id', (req, res) => {
  const clientId = req.params.id;
  if (clients[clientId]) {
    let client = clients[clientId];
    let html = `<h1>User number ${clientId}</h1><ul>`;
    html += `<li>${client.name}, ${client.email}, ${client.city}</li>`;
    html += '</ul>';
    res.send(html);
  } else {
    res.status(404).send('<h1>Error 404: User not found</h1>');
  }
});

app.get('/createuser', (req, res) => {
  let html = `<form action="/createuser" method="post">
                <label for="name">Name:</label><br>
                <input type="text" id="name" name="name"><br>
                <label for="email">Email:</label><br>
                <input type="text" id="email" name="email"><br>
                <label for="city">City:</label><br>
                <input type="text" id="city" name="city"><br>
                <input type="submit" value="Submit">
              </form>`;
  res.send(html);
});

app.post('/createuser', (req, res) => {
  const { name, email, city } = req.body;
   if (!name || !email || !city) {
    res.status(400).send('Bad Request: Both name and email must be provided');
    return;
  }
  id = clients.length > 0 ? clients[clients.length - 1].id + 1 : 1;
  clients.push({ id, name, email, city });
  res.redirect('/clientslist');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});