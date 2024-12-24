import express, { Request, Response } from 'express';
// import sqlite3 from 'sqlite3';
// import { Database, open, Statement } from 'sqlite';
import path from 'path';
import { Game } from './Game';

const app = express();
const PORT = 3005;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Parse json.
app.use(express.json());

// Setup db for all to share.
// let db: Database<sqlite3.Database, sqlite3.Statement>;

// Create an instance of the Game class
// With seeded numbers.
const game = new Game(1234567);


// Route to display main game page.
app.get('/', async (req, res) => {
  console.log("Rendering main page. ")

  // Get units data
  const units = game.getUnits();
  // res.render('index', { grid: game.grid, gridWidth: game.gridWidth, gridHeight: game.gridHeight, units });
  res.render('index', { gridWidth: game.gridWidth, gridHeight: game.gridHeight, units });
});

app.get('/fetch-updates', async (req, res) => {
  const updates = {
    starSystem: game.getStarSystem(), // todo send this once on load only!!!
    players: game.getPlayers(), // todo send once or when changed.
    units: game.getUnits()  // todo only show ships changed.
  };

  res.json(updates);
});

app.post('/ship-new-goto', async (req, res) => {
  // console.log(" DEBUG req = " + JSON.stringify(req));
  // console.log(" DEBUG req.body = " + JSON.stringify(req.body));

  const { shipId, x, y } = req.body;
  console.log(" ***MOVING ship manually, new target - x: " + x + ", y: " + y);
  game.setShipNewGoto(shipId, x, y);
  res.json({ success: true });
});




//   const { shipId, x, y } = req.query;
//   console.log("\n\n\n\n\nTESTING");
//   console.log(" MOVING ship manually, new target - x: " + x + ", y: " + y);
//   game.setShipNewGoto(shipId as string, parseInt(x as string), parseInt(y as string));
//   res.json({ success: true });
// });

const gameSpeed = 1; // seconds
setInterval(() => {
  game.moveUnits();
}, 1000 * gameSpeed);


// TODO show land captured by each player. on toolbar,
// TODO earn res by mining?

// Start the server.
app.listen(PORT, async () => {
  console.log(`SpaceGame Server is running on http://localhost:${PORT}`);

  // Start the game
  game.start();
});

