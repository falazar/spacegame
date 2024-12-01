import express, { Request, Response } from 'express';
// import sqlite3 from 'sqlite3';
// import { Database, open, Statement } from 'sqlite';
import path from 'path';
import { Game } from './Game';

const app = express();
const PORT = 3002;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Setup db for all to share.
// let db: Database<sqlite3.Database, sqlite3.Statement>;

// Create an instance of the Game class
// With seeded numbers.
// const game = new Game(123456);
const game = new Game(1234567);


// Route to display main game page
app.get('/', async (req, res) => {
  // const genre = req.query.genre || '';
  // const boxOfficeHits = req.query.boxOfficeHits || false;
  // const title = req.query.title || '';
  // let minRating: number = req.query.minRating !== undefined ? parseFloat(req.query.minRating as string) : 6;
  // const watchList = req.query.watchList || false;

  console.log("Rendered main page. ")

  // Get units data
  const units = game.getUnits();
  res.render('index', { grid: game.grid, gridWidth: game.gridWidth, gridHeight: game.gridHeight, units });
});

// app.get('/fetch-units', async (req, res) => {
//   const units = game.getUnits();
//   res.json(units);
// });

app.get('/fetch-updates', async (req, res) => {
  const units = game.getUnits();
  const updates = {
    units,
    players: game.getPlayers(),
    gridOwners: game.gridOwners
  };
  res.json(updates);
});

const gameSpeed = 1; // seconds
setInterval(() => {
  game.moveUnits();
}, 1000 * gameSpeed);

// Route to mark a movie as seen
// app.post('/markSeen', async (req, res) => {
//   const { imdbID } = req.query;
//
//   await db.run('UPDATE movies SET seenStatus = "s" WHERE imdbID = ?', [imdbID]);
//
//   res.send('Movie marked as seen');
// });


// TODO show land captured by each player. on toolbar,
// TODO earn gold by mining?

// Start the server.
app.listen(PORT, async () => {
  console.log(`LifeGame Server is running on http://localhost:${PORT}`);

  // Start the game
  game.start();

  // show sample units. debug.
  game.showUnits();
});

