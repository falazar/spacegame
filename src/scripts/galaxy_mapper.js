// Create a map of the game galaxy using a 2d grid and 4 arms spiraling out.
// And the mathematical formula for the spiral is:

// Generate a galaxy map with the given number of arms, points per arm, arm separation, and spread.
function generateSpiralArms(armCount, pointsPerArm, armSeparation, spread, randomizer) {
  const arms = [];
  const occupied = new Map();

  for (let i = 0; i < armCount; i++) {
    const arm = [];
    for (let j = 0; j < pointsPerArm; j++) {
      const angle = j * armSeparation + (i * (2 * Math.PI / armCount));
      const radius = spread * j;
      const x = Math.floor(radius * Math.cos(angle));
      const y = Math.floor(radius * Math.sin(angle));

      // Try and place a new star.
      const star = placeStar(x, y, occupied);
      if (star) {
        arm.push(star);
        const countStarsToAdd = 10; // 10 maybe good. gives 2500 stars. 372 base
        const additionalStars = placeAdditionalStars(x, y, occupied, countStarsToAdd, randomizer);
        arm.push(...additionalStars);
      }
    }
    arms.push(arm);
  }

  console.log('Cell counts:', occupied.size);
  return arms;
}

// Randomly place additional stars around the given point.
function placeAdditionalStars(x, y, occupied, starCount, randomizer) {
  const stars = [];
  for (let i = 0; i < starCount; i++) {
    const newX = x + Math.floor(randomizer.random() * 5) - 2;
    const newY = y + Math.floor(randomizer.random() * 5) - 2;
    const star = placeStar(newX, newY, occupied);
    if (star) {
      stars.push(star);
    }
  }
  return stars;
}

// Place a star at the given point if it is not already occupied.
function placeStar(x, y, occupied) {
  if (x < -50 || y < -50 || x > 49 || y > 49) {
    return null; // Ensure coordinates are within grid bounds
  }
  const key = `${x},${y}`;
  if (!occupied.has(key)) {
    // console.log('Placing star at:', key);
    occupied.set(key, 1);
    return { x, y };
  }
  return null;
}

// Randomizer class to handle seeded random number generation
class Randomizer {
  constructor(seed) {
    this.seed = seed;
  }

  random() {
    let x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
}

function drawGalaxyMap(arms) {
  const grid = document.getElementById('grid');
  if (!grid) return;

  const cells = new Map();

  for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (i === 50 && j === 50) {
        cell.classList.add('center');
      }
      grid.appendChild(cell);
      cells.set(`${i},${j}`, cell);
    }
  }

  arms.forEach(arm => {
    arm.forEach(point => {
      const cell = cells.get(`${point.x + 50},${point.y + 50}`);
      if (cell) {
        cell.classList.add('arm');
        cell.classList.add(`${point.x},${point.y}`);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const seed = 12345; // Use a constant seed value
  const randomizer = new Randomizer(seed);
  const arms = generateSpiralArms(4, 80, 0.1, 0.7, randomizer);
  drawGalaxyMap(arms);
});