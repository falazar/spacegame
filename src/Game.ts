// src/Game.ts
import { Player } from './Player';
import { Unit } from './Unit';
import * as assert from "node:assert";

export class Game {
  private players: Player[];
  private units: Unit[];
  private seed: number;
  gridWidth = 63; // Number of grid squares.
  gridHeight = 35;
  grid = new Array(this.gridHeight).fill(1).map(() => new Array(this.gridWidth).fill(1));
  gridOwners = new Array(this.gridHeight).fill(0).map(() => new Array(this.gridWidth).fill(0));

  constructor(seed: number) {
    this.players = [];
    this.units = [];
    this.seed = seed;
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


  // Generic move method to shift soldiers around.
  moveUnits() {
    const second = new Date().getSeconds();
    // if (second % 10 === 0) {
    console.log(`--------------------------------------`);
    console.log(`${second}s: Moving ships now`);
    // }

    // Clear out all dead units now.
    this.units = this.units.filter(u => u.health > 0);

    this.units.forEach((unit: Unit) => {
        console.log(`  Unit P${unit.playerId}:${unit.name} at ${unit.x},${unit.y} Health:${unit.health}  goto:${unit.gotoX || 0},${unit.gotoY || 0}`);

        // TODO make all a method.
        if (unit.health <= 0) {
          console.log(`    Unit ${unit.name}:${unit.x},${unit.y} is dead, cant attack...`);
          return;  // Skip dead units.
        }

        this.chooseUnitAction(unit);
      }
    );
  }

  // TODO change names, hmmm. move only here?
  chooseUnitAction(unit: Unit) {
    // Unit new coords.
    let x: number = unit.x;
    let y: number = unit.y;

    let moved = false;
    // todo add search range.
    // todo add attack ranged.


    // If unit is guard, check range and go to attack!
    // if (unit.type === 'guard') {
    //   // Check if any enemy units are in range.
    //   const { enemyUnitInRange, closestDistance } = this.findNearestEnemyUnit(unit);
    //
    //   if (enemyUnitInRange != null && closestDistance < 6) { // todo fix.
    //     const enemyUnit = enemyUnitInRange as Unit;
    //     console.log(`    Unit found enemy unit P${enemyUnit.playerId}:${enemyUnit.name} in range:${closestDistance} at ${enemyUnit.x}, ${enemyUnit.y}`);
    //
    //     // Move towards enemy unit.
    //     ({ x, y } = this.moveTowardSpot(unit, enemyUnit.x, enemyUnit.y));
    //
    //     // TODO if blocked by land move randomly. todo
    //     moved = true;
    //   }
    // } else if (unit.type === 'soldier') {
    //   // Check if any enemy units are in range.
    //   const { enemyUnitInRange, closestDistance } = this.findNearestEnemyUnit(unit);
    //
    //   if (enemyUnitInRange != null && closestDistance < 8) { // todo fix.
    //     const enemyUnit = enemyUnitInRange as Unit;
    //     console.log(`    Unit found enemy unit P${enemyUnit.playerId}:${enemyUnit.name} in range:${closestDistance} at ${enemyUnit.x}, ${enemyUnit.y}`);
    //
    //     // Move towards enemy unit.
    //     ({ x, y } = this.moveTowardSpot(unit, enemyUnit.x, enemyUnit.y));
    //
    //     // TODO if blocked by land move randomly. todo
    //     if (this.isWalkableTerrain(x, y, unit)) {
    //       moved = true;
    //     } // else will move randomly later.
    //   }
    // } else if (unit.type === 'captain') {
    //   // Check if any enemy units are in range.
    //   const { enemyUnitInRange, closestDistance } = this.findNearestEnemyUnit(unit);
    //
    //   if (enemyUnitInRange != null && closestDistance < 20) {
    //     const enemyUnit = enemyUnitInRange as Unit;
    //     console.log(`    Unit found enemy unit P${enemyUnit.playerId}:${enemyUnit.name} in range:${closestDistance} at ${enemyUnit.x}, ${enemyUnit.y}`);
    //
    //     // TODO Call to other units to go there.
    //     const player: Player | undefined = this.getPlayers().find(p => p.id === enemyUnit.playerId);
    //     // random chance to reset this one again...
    //     // or should it target a unit???
    //     if (player && player.targetX === null) {
    //       player.targetX = enemyUnit.x;
    //       player.targetY = enemyUnit.y;
    //       console.log(`    &&& Player ${player.name} is setting alarm target on enemy unit at ${enemyUnit.x}, ${enemyUnit.y}`);
    //     }
    //
    //
    //     // Move towards enemy unit.
    //     ({ x, y } = this.moveTowardSpot(unit, enemyUnit.x, enemyUnit.y));
    //
    //     // TODO if blocked by land move randomly. todo
    //     if (this.isWalkableTerrain(x, y, unit)) {
    //       moved = true;
    //     } // else will move randomly later.
    //   }
    // }

    // Randomly 1 in 10 make the ship move to nearby new location.
    const r = Math.random();
    // console.log(`    Random number = ${r} and unit.gotoX = ${unit.gotoX || 0}`);
    if (r < 0.1 && unit.gotoX == null) {
      // unit.moving = true;
      // Set to 0.1 decimal.
      // unit.gotoX = Math.random() * this.gridWidth;
      // unit.gotoY = Math.random() * this.gridHeight;
      unit.gotoX = Math.floor(this.seededRandom() * this.gridWidth * 10) / 10;
      unit.gotoY = Math.floor(this.seededRandom() * this.gridHeight * 10) / 10;
      console.log(`    ***Update: Unit ${unit.name} is going to ${unit.gotoX}, ${unit.gotoY}`);
    }

    // Figure when they are stopped.
    // if (!unit.moving) {
    //   // unit.moveDir = Math.floor(Math.random() * 6);
    // }

    // console.log(`    Unit moving.`);

    // TODO TEST.



    // TODO Later should run from enemies too...

    // Move now, one decimal towards our goal.
    if (unit.gotoX !== null && unit.gotoY !== null) {
      // TODO also check if close, then stop.
      // See if we are there yet.
      if (unit.x === unit.gotoX && unit.y === unit.gotoY) {
        console.log(`    Unit ${unit.name} has arrived at ${unit.gotoX}, ${unit.gotoY}\n\n\n\n\n`);
        unit.gotoX = null;
        unit.gotoY = null;
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
      console.log(`    speedX=${speedX} speedY=${speedY}`);
      // Format to one decimal point.
      // x = unit.x + speedX;
      // y = unit.y + speedY;
      x = Math.round((unit.x + speedX) * 100) / 100;
      y = Math.round((unit.y + speedY) * 100) / 100;
      console.log(`    Unit ${unit.name} moving from ${unit.x}, ${unit.y} to ${x}, ${y}`);
    } // if moving.


    // TODO If same team units bump into eachother, chance to upgrade if same unit.

    // TODO if anything hit.
    if (!this.isWalkable(x, y, unit)) {
      unit.moveDir = Math.floor(Math.random() * 6);
      console.log(`    *** Unit explorer hit blocker at ${x}, ${y}, choosing new dir now...=${unit.moveDir}`);
    }
    moved = true;


    // Check on map and valid move and empty spot, if not no move.
    // TODO make method.
    // if (!this.inBounds(x, y)) {
    //   // console.log('  Out of bounds hit wall at x:', x, 'y:', y);
    //   return;
    // } else
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

  isNextToWater(fromX: number, fromY: number) {
    // TODO

    // Check all neighbors method.
    for (let dir = 0; dir < 6; dir++) {
      let x = fromX;
      let y = fromY;
      const even = x % 2 === 0;
      switch (dir) {
        case 0:
          x++;
          if (!even) y++;
          break;
        case 1:
          x++;
          if (even) y--;
          break;
        case 2:
          y--;
          break;
        case 3:
          x--;
          if (even) y--;
          break;
        case 4:
          x--;
          if (!even) y++;
          break;
        case 5:
          y++;
          break;
      }
      if (this.inBounds(x, y) && this.grid[x][y] === 0) {
        return true;
      }

    }
    return false;
  }

  // Search all nearby grid spots for a good water area.
  findNearestWater(unit: Unit) {
    // Check all spots around unit.
    let closestDistance = 1000;
    let waterPos = null;
    for (let x = unit.x - 5; x < unit.x + 5; x++) {
      for (let y = unit.y - 5; y < unit.y + 5; y++) {
        if (this.inBounds(x, y) && this.grid[x][y] === 0) {
          const distance = Math.abs(x - unit.x) + Math.abs(y - unit.y);
          if (distance < closestDistance) {
            closestDistance = distance;
            waterPos = { x, y };
          }
        }
      }
    }
    // TODO add to target probably.
    // and his current action, so we dont repeat this all the time.

    if (waterPos === null) {
      console.log(`    DEBUG: No water found near unit ${unit.x}, ${unit.y}`);
    } else {
      console.log(`    DEBUG: Found water at ${waterPos.x}, ${waterPos.y} closest distance = ${closestDistance}`);
    }

    return waterPos;
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

  moveAwayFromSpot(unit: Unit, x: number, y: number) {
    // Choose 1-6 hex direction 1 north 23 4 south 56
    let newX = unit.x;
    let newY = unit.y;
    if (unit.y < y) {
      // console.log('    target is south');
      // Move south.
      if (unit.x < x) {
        // Move east.
        // If on odd hex move differently.
        if (unit.x % 2 === 0) {
          newX--;
        } else {
          newX--;
          newY--;
        }
      } else if (unit.x > x) {
        // Move west.
        // If on odd hex move differently.
        if (unit.x % 2 === 0) {
          newX++;
        } else {
          newX++;
          newY--;
        }
      } else {
        // Move south.
        newY--;
      }
    } else {
      // console.log('    target is north');
      // Move north.
      if (unit.x < x) {
        // console.log('    target is east');
        // Move east.
        // If on odd hex move differently.
        if (unit.x % 2 === 0) {
          newX--;
          newY++;
          // console.log('    adding x++ y--');
        } else {
          // console.log('    adding x++ ');
          newX--;
        }
      } else if (unit.x > x) {
        // Move west.
        // console.log('    target is west');
        // If on odd hex move differently.
        if (unit.x % 2 === 0) {
          newX++;
          newY++;
          // console.log('    adding x-- y--');
        } else {
          // console.log('    adding x-- ');
          newX++;
        }
      } else {
        // Move north.
        newY++;
      }
    }
    console.log(`    DEBUG: Moving unit away, from ${unit.x}, ${unit.y} to ${newX}, ${newY}`);

    return { x: newX, y: newY };
  }

  moveTowardSpot(unit: Unit, x: number, y: number) {
    // Choose 1-6 hex direction 1 north 23 4 south 56
    let newX = unit.x;
    let newY = unit.y;
    if (unit.y < y) {
      // console.log('    target is south');
      // Move south.
      // todo x 3 choices
      if (unit.x < x) {
        // Move east.
        // If on odd hex move differently.
        if (unit.x % 2 === 0) {
          newX++;
        } else {
          newX++;
          newY++;
        }
      } else if (unit.x > x) {
        // Move west.
        // If on odd hex move differently.
        if (unit.x % 2 === 0) {
          newX--;
        } else {
          newX--;
          newY++;
        }
      } else {
        // Move south.
        newY++;
      }
    } else {
      // console.log('    target is north');
      // Move north.
      if (unit.x < x) {
        // console.log('    target is east');
        // Move east.
        // If on odd hex move differently.
        if (unit.x % 2 === 0) {
          newX++;
          newY--;
          // console.log('    adding x++ y--');
        } else {
          // console.log('    adding x++ ');
          newX++;
        }
      } else if (unit.x > x) {
        // Move west.
        // console.log('    target is west');
        // If on odd hex move differently.
        if (unit.x % 2 === 0) {
          newX--;
          newY--;
          // console.log('    adding x-- y--');
        } else {
          // console.log('    adding x-- ');
          newX--;
        }
      } else {
        // Move north.
        newY--;
      }
    }
    console.log(`    DEBUG: Moving unit  from ${unit.x}, ${unit.y} to ${newX}, ${newY}`);

    return { x: newX, y: newY };
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

  start() {
    console.log('Starting game...');
    // this.createNewMap();

    this.addInitialGameData();
  }

  addInitialGameData() {
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
    // unit = new Unit(player1.id, "Falazar", 'ship1', 12, 10, player1.color);
    // this.addUnit(unit);
  }
}