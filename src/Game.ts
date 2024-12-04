// src/Game.ts
import { Player } from './Player';
import { Unit } from './Unit';
import * as assert from "node:assert";

export class Game {
  private players: Player[];
  private units: Unit[];
  private seed: number;
  gridWidth = 80;
  gridHeight = 80;
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

  // Pick any random neighbor hex, 1.
  getRandomNeighbor(x: number, y: number) {
    // const dir = Math.floor(Math.random() * 6);
    const dir = Math.floor(this.seededRandom() * 6);

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
    // console.log(`  DEBUG: Random neighbor dir = ${dir}, col = ${col}, row = ${row}`);

    return { x, y };
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


  // TODO make percents instead!!!
  addRandomWaters() {
    // let waterSize = 30;
    let waterSize = 200;
    // todo make some edges water?

    // Starting at center, put in some random waters.
    while (waterSize > 0) {
      const col = Math.floor(this.gridWidth / 2 + this.seededRandom() * this.gridWidth - this.gridWidth / 2);
      const row = Math.floor(this.gridHeight / 2 + this.seededRandom() * this.gridHeight - this.gridHeight / 2);
      // If in bounds set to water.
      if (col >= 0 && col < this.gridWidth && row >= 0 && row < this.gridHeight) {
        this.grid[col][row] = 0;
        waterSize--;
      }
    }
  }

  // TODO make percents instead!!!
  // Spread water around more on map to make barriers.
  spreadWaters() {
    // let waterSize = 190;
    // let waterSize = 900;
    let waterSize = 1200;

    // Find a random spot of water, then go random dir and add more water.
    console.log('Spreading water... ');
    while (waterSize > 0) {
      let counter = 0;
      let col = 0;
      let row = 0;
      // TODO MAKE METHOD.
      do {
        col = Math.floor(this.gridWidth / 2 + this.seededRandom() * this.gridWidth - this.gridWidth / 2);
        row = Math.floor(this.gridHeight / 2 + this.seededRandom() * this.gridHeight - this.gridHeight / 2);
        counter++;
      } while (this.grid[col][row] !== 0 && counter < 500);
      // console.log(`Found water at (${col}, ${row})`);

      // Go one random spot neighbor and add water.
      const { x: x2, y: y2 } = this.getRandomNeighbor(col, row);
      // console.log(`Random neighbor: (${x2}, ${y2})`);

      // If in bounds set to water.
      if (x2 >= 0 && x2 < this.gridWidth && y2 >= 0 && y2 < this.gridHeight) {
        // console.log(`${waterSize}: Adding water from (${col}, ${row}) to (${x2}, ${y2})`);
        this.grid[x2][y2] = 0;
      } else {
        // console.log('Out of bounds, skipping...');
      }

      waterSize--;
    }
  }


  // todo pull grid back to server.
  // todo move all this to maps.
  // Build up a random map.
  createNewMap() {
    console.log('Building random map...');
    this.addRandomWaters();
    this.spreadWaters();
  }


  // Generic move method to shift soldiers around.
  moveUnits() {
    const second = new Date().getSeconds();
    // if (second % 10 === 0) {
    console.log(`--------------------------------------`);
    console.log(`${second}s: Moving units now`);
    // }

    // Clear out all dead units now.
    this.units = this.units.filter(u => u.health > 0);

    this.units.forEach((unit: Unit) => {
        console.log(`  Unit P${unit.playerId}:${unit.name} at ${unit.x},${unit.y} H:${unit.health} is moving...`);
        // TODO make all a method.
        if (unit.health <= 0) {
          console.log(`    Unit ${unit.name}:${unit.x},${unit.y} is dead, cant attack...`);
          return;  // Skip dead units.
        }

        this.chooseUnitAction(unit);

      }
    );
  }

  chooseUnitAction(unit: Unit) {
    // Check special actions:
    if (unit.type === 'trainer') {
      // TODO Check gold first... and food?

      // 5% chance to spawn a new unit.
      if (Math.random() < 0.05) {
        // todo make method.
        const r = Math.random();
        // TODO modifiers after awhile bought.
        // Command which troop to buy.

        // // Lower is better troops.
        // if (r >= 0.45) { // 55%
        //   const newUnit = new Unit(unit.playerId, 'guard', unit.x, unit.y, unit.color);
        //   this.addUnit(newUnit);
        // } else if (r >= 0.25) { // 20%
        //   const newUnit = new Unit(unit.playerId, 'explorer', unit.x, unit.y, unit.color);
        //   this.addUnit(newUnit);
        // } else if (r >= 0.17) { // 8%
        //   const newUnit = new Unit(unit.playerId, 'soldier', unit.x, unit.y, unit.color);
        //   this.addUnit(newUnit);
        // } else if (r >= 0.10) { // 7%
        //   const newUnit = new Unit(unit.playerId, 'builder', unit.x, unit.y, unit.color);
        //   this.addUnit(newUnit);
        // } else if (r >= 0.05) { // 5%
        //   const newUnit = new Unit(unit.playerId, 'captain', unit.x, unit.y, unit.color);
        //   this.addUnit(newUnit);
        // } else {  // 5%
        //   const newUnit = new Unit(unit.playerId, 'trainer', unit.x, unit.y, unit.color);
        //   this.addUnit(newUnit);
        // }
        return; // no movement if unit created.
      }
    }

    // Unit new coords.
    let x: number = unit.x;
    let y: number = unit.y;

    let moved = false;
    // todo add search range.
    // todo add attack ranged.


    // Builder can build walls and farms and things.
    if (unit.type === 'builder') {
      // Check if any enemy units are in range.
      const { enemyUnitInRange, closestDistance } = this.findNearestEnemyUnit(unit);

      if (enemyUnitInRange != null && closestDistance < 10) {
        const enemyUnit = enemyUnitInRange as Unit;
        console.log(`    Unit found enemy unit P${enemyUnit.playerId}:${enemyUnit.name} in range:${closestDistance} at ${enemyUnit.x}, ${enemyUnit.y}`);

        // Move towards enemy unit.
        ({ x, y } = this.moveAwayFromSpot(unit, enemyUnit.x, enemyUnit.y));
        // TODO move away from enemy.

        // TODO if blocked by land move randomly. todo
        moved = true;
      } else {

        console.log(`    Unit P${unit.playerId}:${unit.name} is looking for water...`);
        // TODO check if touching water, build farm now.
        if (this.isNextToWater(unit.x, unit.y)) {
          console.log("I WANT TO BUILD A FARM HERE!");
          moved = true;
          // TODO
        } else {
          // If no enemy in range, they need to find the nearest water area to make a farm,
          // if we dont need food then do something else.
          const waterPos: { x: number, y: number } | null = this.findNearestWater(unit);
          if (waterPos !== null) {
            const { x: toX, y: toY } = waterPos;  // destructure
            console.log(`    Unit found water at ${toX}, ${toY}`);
            // Move towards water hex.
            ({ x, y } = this.moveTowardSpot(unit, toX, toY));
            // ({ x, y } = this.moveTowardSpot(unit, waterPos!.x, waterPos!.y)); //  error for some reason.
            moved = true;
          }
        }
      }
    }

    // If unit is guard, check range and go to attack!
    if (unit.type === 'guard') {
      // Check if any enemy units are in range.
      const { enemyUnitInRange, closestDistance } = this.findNearestEnemyUnit(unit);

      if (enemyUnitInRange != null && closestDistance < 6) { // todo fix.
        const enemyUnit = enemyUnitInRange as Unit;
        console.log(`    Unit found enemy unit P${enemyUnit.playerId}:${enemyUnit.name} in range:${closestDistance} at ${enemyUnit.x}, ${enemyUnit.y}`);

        // Move towards enemy unit.
        ({ x, y } = this.moveTowardSpot(unit, enemyUnit.x, enemyUnit.y));

        // TODO if blocked by land move randomly. todo
        moved = true;
      }
    } else if (unit.type === 'soldier') {
      // Check if any enemy units are in range.
      const { enemyUnitInRange, closestDistance } = this.findNearestEnemyUnit(unit);

      if (enemyUnitInRange != null && closestDistance < 8) { // todo fix.
        const enemyUnit = enemyUnitInRange as Unit;
        console.log(`    Unit found enemy unit P${enemyUnit.playerId}:${enemyUnit.name} in range:${closestDistance} at ${enemyUnit.x}, ${enemyUnit.y}`);

        // Move towards enemy unit.
        ({ x, y } = this.moveTowardSpot(unit, enemyUnit.x, enemyUnit.y));

        // TODO if blocked by land move randomly. todo
        if (this.isWalkableTerrain(x, y, unit)) {
          moved = true;
        } // else will move randomly later.
      }
    } else if (unit.type === 'captain') {
      // Check if any enemy units are in range.
      const { enemyUnitInRange, closestDistance } = this.findNearestEnemyUnit(unit);

      if (enemyUnitInRange != null && closestDistance < 20) {
        const enemyUnit = enemyUnitInRange as Unit;
        console.log(`    Unit found enemy unit P${enemyUnit.playerId}:${enemyUnit.name} in range:${closestDistance} at ${enemyUnit.x}, ${enemyUnit.y}`);

        // TODO Call to other units to go there.
        const player: Player | undefined = this.getPlayers().find(p => p.id === enemyUnit.playerId);
        // random chance to reset this one again...
        // or should it target a unit???
        if (player && player.targetX === null) {
          player.targetX = enemyUnit.x;
          player.targetY = enemyUnit.y;
          console.log(`    &&& Player ${player.name} is setting alarm target on enemy unit at ${enemyUnit.x}, ${enemyUnit.y}`);
        }


        // Move towards enemy unit.
        ({ x, y } = this.moveTowardSpot(unit, enemyUnit.x, enemyUnit.y));

        // TODO if blocked by land move randomly. todo
        if (this.isWalkableTerrain(x, y, unit)) {
          moved = true;
        } // else will move randomly later.
      }
    }
    else if (unit.type === 'explorer' || unit.type === 'ship1') {
      if (unit.moveDir === null) {
        unit.moveDir = Math.floor(Math.random() * 6);
      }
      console.log(`    Unit explorer moving in dir ${unit.moveDir}`);

      // TODO TEST.
      // TODO make method.
      // Move in a direction.
      // 1-6 hex direction 1 north 23 4 south 56
      if (unit.moveDir === 0) {
        y--;
      } else if (unit.moveDir === 1) {
        x++;
        if (unit.x % 2 === 0) {
          y--;
        }
      } else if (unit.moveDir === 2) {
        x++;
        if (unit.x % 2 !== 0) {
          y++;
        }
      } else if (unit.moveDir === 3) { // south
        y++;
      } else if (unit.moveDir === 4) {
        x--;
        if (unit.x % 2 !== 0) {
          y++;
        }
      } else if (unit.moveDir === 5) {
        x--;
        if (unit.x % 2 === 0) {
          y--;
        }
      }

      // TODO if anything hit, change dir.
      if (!this.isWalkable(x, y, unit)) {
        unit.moveDir = Math.floor(Math.random() * 6);
        console.log(`    *** Unit explorer hit blocker at ${x}, ${y}, choosing new dir now...=${unit.moveDir}`);
      }
      moved = true;

      // TODO Later should run from enemies too...
    }

    // If didnt do a specific move, just move randomly.
    if (!moved) {
      ({ x, y } = this.getRandomNeighbor(unit.x, unit.y));
      // console.log("    Random movement now...")
      // TODO maybe check their intelligence first.... buyable thingy.
      if (!this.isWalkableTerrain(x, y, unit)) {
        console.log("    RETRY Random movement now...");
        ({ x, y } = this.getRandomNeighbor(unit.x, unit.y));
      }
    }
    // console.log(`  DEBUG: Moving unit ${unit.id} from x:${unit.x}, y:${unit.y} to x:${x}, y:${y}`);


    // TODO If same team units bump into eachother, chance to upgrade if same unit.


    // Check on map and valid move and empty spot, if not no move.
    // TODO make method.
    // if (!this.inBounds(x, y)) {
    //   // console.log('  Out of bounds hit wall at x:', x, 'y:', y);
    //   return;
    // } else
    if (!this.isWalkable(x, y, unit)) {
      // If unit bump into an enemy attack.
      const unitAt = this.units.find(u => u.x === x && u.y === y);
      if (unitAt) {
        // console.log(`    DEBUG:Unit ${unit.id} bumped into unit ${unitAt.id}`);
        if (unitAt.playerId !== unit.playerId) { // Cant attack yourself.
          this.unitAttackUnit(unit, unitAt);
        }
      }
      return;
    } else {
      // Save our actual new position now and claim land.
      unit.x = x;
      unit.y = y;
      // Claim hex land
      this.gridOwners[x][y] = unit.playerId;
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
    const player3 = new Player(3, 'Crag', 'yellow');
    this.addPlayer(player3);

    // Add some test ships.
    let unit;
    unit = new Unit(player1.id, "Falazar", 'ship1', 10, 10, player1.color);
    this.addUnit(unit);
    unit = new Unit(player1.id, "Falazar", 'ship1', 12, 10, player1.color);
    this.addUnit(unit);

  }
}