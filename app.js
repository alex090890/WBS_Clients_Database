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
    res.redirect('/home');
  } else {
    res.status(401).send(`
  <h1>Error: Invalid username or password.</h1>
  <button style="background-color: green; color: white;" onclick="location.href='/'">Return to the login page</button>
`);
  }
});

app.get('/home', (req, res) => {
  res.send(`
  <h1>Welcome to the home page</h1>
  <button style="background-color: green; color: white;" onclick="location.href='/clients'">View clients in the JSON format</button>
  <button style="background-color: green; color: white;" onclick="location.href='/clientslist'">View clients list</button>
  <button style="background-color: green; color: white;" onclick="location.href='/createuser'">Create a new user</button>
  `)
});

//Display the list of clients in the JSON format
app.get('/clients', (req, res) => {
  res.json(clients);
});

//Display the list of clients in the HTML format
app.get('/clientslist', (req, res) => {
  let html = clients.map((client, index) => {
    return `
      <li>
        ${client.name}, ${client.email}, ${client.city} <a href="/update-client/${client.id - 1}">Update</a>
        <form action="/update-client/${client.id}" method="post">
          <input type="hidden" name="name" value="${client.name}">
          <input type="hidden" name="email" value="${client.email}">
          <input type="hidden" name="city" value="${client.city}">
          <input type="hidden" name="submit" value="Update">
        </form>
        <form action="/delete-client/${client.id}" method="post">
          <input type="submit" value="Delete">
        </form>
      </li>
    `;
  }).join('');
  res.send(html);
});

//Handle the client deletion
app.post('/delete-client/:id', (req, res) => {
  const id = req.params.id;
  if (id >= 0 && id < clients.length) {
    clients.splice(id, 1);
    res.redirect('/clientslist');
  } else {
    res.status(400).send('Invalid client ID');
  }
});

//Handle the update client
app.get('/update-client/:id', (req, res) => {
  const id = req.params.id;
  if (id >= 0 && id < clients.length) {
    const client = clients[id];
    let html = `
      <form action="/update-client/${id}" method="post">
        Name: <input type="text" name="name" value="${client.name}"><br>
        Email: <input type="text" name="email" value="${client.email}"><br>
        City: <input type="text" name="city" value="${client.city}"><br>
        <input type="submit" value="Update">
      </form>
    `;
    res.send(html);
  } else {
    res.status(400).send('Invalid client ID');
  }
});

app.post('/update-client/:id', (req, res) => {
  const id = req.params.id;
  if (id >= 0 && id < clients.length) {
    const { name, email, city } = req.body;
    clients[id] = { name, email, city };
    res.redirect('/clientslist');
  } else {
    res.status(400).send('Invalid client ID');
  }
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
  id = (clients.length > 0 && !isNaN(clients[clients.length - 1].id)) ? clients[clients.length - 1].id + 1 : 1;
  clients.push({ id, name, email, city });
  res.redirect('/clientslist');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});