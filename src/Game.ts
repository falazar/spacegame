// src/Game.ts
import { Player } from './Player';
import { Unit } from './Unit';
import * as assert from "node:assert";

export class Game {
  private starSystem: { id: string, name: string };
  private players: Player[];
  private units: Unit[];
  private seed: number;
  gridWidth = 63; // Number of grid squares.
  gridHeight = 35;
  grid = new Array(this.gridHeight).fill(1).map(() => new Array(this.gridWidth).fill(1));

  // gridOwners = new Array(this.gridHeight).fill(0).map(() => new Array(this.gridWidth).fill(0));

  constructor(seed: number) {
    this.seed = seed;
    this.starSystem = { id: '', name: '' };
    this.players = [];
    this.units = [];
  }

  start() {
    console.log('Starting game...');
    // this.createNewMap();

    this.addInitialGameData();
  }

  addInitialGameData() {
    // Add test star system now.
    this.starSystem = {
      id: '12345',
      name: 'Eridani',
    }

    // Add test players.
    const player1 = new Player(1, 'Falazar', 'blue');
    this.addPlayer(player1);
    const player2 = new Player(2, 'Mobby', 'red');
    this.addPlayer(player2);
    // const player3 = new Player(3, 'Crag', 'yellow');
    // this.addPlayer(player3);

    // Add some test ships.
    let unit;
    unit = new Unit(player1.id, "Falazar", 'ship1', 10, 10, player1.color);
    this.addUnit(unit);
    unit = new Unit(player1.id, "Falazar", 'ship1', 12, 10, player1.color);
    this.addUnit(unit);
  }

  // Generic move method to shift soldiers around.
  moveUnits() {
    const second = new Date().getSeconds();
    if (second % 10 === 0) {
      console.log(`--------------------------------------`);
      console.log(`${second}s: Moving ships now`);
    }

    // Clear out all dead units now.
    this.units = this.units.filter(u => u.health > 0);

    this.units.forEach((unit: Unit) => {
        // console.log(`  Unit P${unit.playerId}:${unit.name} at ${unit.x},${unit.y} Health:${unit.health}  goto:${unit.gotoX || 0},${unit.gotoY || 0}`);

        if (unit.health <= 0) {
          console.log(`    Unit ${unit.name}:${unit.x},${unit.y} is dead, cant attack...`);
          return;  // Skip dead units.
        }

        this.moveUnit(unit);
      }
    );
  }

  // Move our Unit in current direction, handle any events here.
  moveUnit(unit: Unit) {
    // todo add search range.
    // todo add attack ranged.

    // For Testing Randomly 1 in 10 make the ship move to nearby new location.
    const r = Math.random();
    // console.log(`    Random number = ${r} and unit.gotoX = ${unit.gotoX || 0}`);
    if (r < 0.1 && unit.gotoX == null) {
      // unit.moving = true;
      // Set to 0.1 decimal.
      unit.gotoX = Math.floor(this.seededRandom() * this.gridWidth * 10) / 10;
      unit.gotoY = Math.floor(this.seededRandom() * this.gridHeight * 10) / 10;
      console.log(`    ***Update: Unit ${unit.name} is going from ${unit.x}, ${unit.y} to ${unit.gotoX}, ${unit.gotoY}`);
    }

    // Move now, one decimal towards our goal, check events.
    if (unit.gotoX !== null && unit.gotoY !== null) {
      unit.moving = true;
      this.moveShipTowardGoto(unit);
    } // if moving.

  }

  // If a ship has a goto location, move toward that now a step, check obstacles after.
  moveShipTowardGoto(unit: Unit) {
    if (unit.gotoX == null || unit.gotoY == null) {
      return;
    }

    // Move now, one decimal towards our goal.
    // See if we are there yet.
    if (Math.abs(unit.x - unit.gotoX) <= 0.3 && Math.abs(unit.y - unit.gotoY) <= 0.3) {
      console.log(`    Unit ${unit.name} has arrived at ${unit.gotoX}, ${unit.gotoY}\n\n\n\n\n`);
      unit.gotoX = null;
      unit.gotoY = null;
      unit.moving = false;
      return;
    }

    // Move our speed partial forward now.
    const dx = unit.gotoX - unit.x;
    const dy = unit.gotoY - unit.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 0.1;  // hardcoded for now.
    // Format this to one decimal point.
    const speedX = Math.round(dx / dist * speed * 100) / 100;
    const speedY = Math.round(dy / dist * speed * 100) / 100;
    // console.log(`    speedX=${speedX} speedY=${speedY}`);
    // Format to one decimal point.
    const x = Math.round((unit.x + speedX) * 100) / 100;
    const y = Math.round((unit.y + speedY) * 100) / 100;
    // console.log(`    Unit ${unit.name} moving from ${unit.x}, ${unit.y} to ${unit.x}, ${unit.y}`);

    // Check on map and valid move and empty spot, if not no move.
    if (!this.isWalkable(x, y, unit)) {
      // // If unit bump into an enemy attack.
      // const unitAt = this.units.find(u => u.x === x && u.y === y);
      // if (unitAt) {
      //   // console.log(`    DEBUG:Unit ${unit.id} bumped into unit ${unitAt.id}`);
      //   if (unitAt.playerId !== unit.playerId) { // Cant attack yourself.
      //     this.unitAttackUnit(unit, unitAt);
      //   }
      // }
      return;
    } else {
      // Save our actual new position now and claim land.
      unit.x = x;
      unit.y = y;

      // Claim hex land
      // this.gridOwners[x][y] = unit.playerId;
      return;
    }
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  addUnit(unit: Unit) {
    this.units.push(unit);
  }

  // Debug method.
  showUnits() {
    this.units.forEach((unit) => {
      console.log(unit);
    });
  }

  getStarSystem() {
    return this.starSystem;
  }

  getUnits() {
    return this.units;
  }

  getPlayers() {
    return this.players;
  }

  inBounds(x: number, y: number) {
    return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
  }

  // Seeded random number generator
  seededRandom() {
    let x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Is the square able to be walked on?
  // later look for other units, etc.
  isWalkable(x: number, y: number, unit: Unit) {
    if (!this.isWalkableTerrain(x, y, unit)) {
      return false;
    }

    // // Check if another unit is there.
    // for (const otherUnit of this.units) {
    //   if (otherUnit.x === x && otherUnit.y === y && otherUnit.id !== unit.id) {
    //     // console.log(`  Unit ${unit.id} tried to walk on unit ${otherUnit.id}`);
    //     return false;
    //   }
    // }

    return true;
  }

  // Is the square able to be moved on?
  isWalkableTerrain(x: number, y: number, unit: Unit) {
    if (!this.inBounds(x, y)) {
      return false;
    }

    // const type = this.grid[x][y];
    // // For now no one can walk on water.
    // if (type === 0) {
    //   return false;
    // }

    return true;
  }


  // todo pull grid back to server.
  // todo move all this to maps.
  // Build up a random map.
  createNewMap() {
    console.log('Building random map...');
    // this.addRandomWaters();
    // this.spreadWaters();
  }


  findNearestEnemyUnit(unit: Unit) {
    const enemyUnits = this.units.filter(u => u.playerId !== unit.playerId);
    // const enemyUnitInRange = enemyUnits.find(u => Math.abs(u.x - unit.x) < 3 && Math.abs(u.y - unit.y) < 3);

    let enemyUnitInRange: Unit | null = null;
    let closestDistance = 1000;
    enemyUnits.forEach((u: Unit) => {
      const distance = Math.abs(u.x - unit.x) + Math.abs(u.y - unit.y);
      if (distance < closestDistance) {
        closestDistance = distance;
        enemyUnitInRange = u as Unit;
      }
    });
    // console.log('    DEBUG: Closest distance = ', closestDistance);

    return { enemyUnitInRange, closestDistance };
  }

  unitAttackUnit(unit: Unit, unitAt: Unit) {
    unitAt.health -= unit.attack;
    console.log(`    Unit P${unit.playerId}:${unit.name}:${unit.x},${unit.y} attacked unit P${unitAt.playerId}:${unitAt.name}:${unitAt.x},${unitAt.y} for ${unit.attack} damage Now health is ${unitAt.health}`);
    if (unitAt.health <= 0) {
      // // Remove unit.
      // this.units = this.units.filter(u => u.id !== unitAt.id);
      console.log(`      Unit ${unitAt.name}:${unitAt.x},${unitAt.y} has died`);
      // TODO Do some display stuff...
      // TODO Add to fight log at bottom of toolbar.
    }
  }

  setShipNewGoto(shipId: string, x: number, y: number) {
    const unit = this.units.find(u => u.id === shipId);
    if (unit) {
      unit.gotoX = x;
      unit.gotoY = y;
    } else {
      console.log(`    ERROR: Ship ${shipId} not found.`);
    }
  }

}