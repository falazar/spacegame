// src/Unit.ts
import { Player } from './Player';
import { v4 as uuidv4 } from 'uuid';

export class Unit {
  id: string;
  playerId: number;
  playerName: string;
  type: string;
  name: string;
  x: number;
  y: number;
  color: string;
  health: number;
  attack: number;
  moveDir: number | null;
  gotoX: number | null;
  gotoY: number | null;
  // TODO Can I do this as a pair? coords?

  constructor(playerId: number, playerName: string, type: string, x: number, y: number, color: string) {
    this.id = uuidv4();
    this.playerId = playerId;
    this.playerName = playerName;
    this.type = type;
    this.name = type + this.id[0];
    this.x = x;
    this.y = y;
    this.color = color;
    this.moveDir = null
    this.gotoX = null;
    this.gotoY = null;

    // Get health and attack and stats based on type.
    if (type === 'trainer') {
      this.health = 20;
      this.attack = 1;
    } else if (type === 'guard') {
      this.health = 3;
      this.attack = 2;
    } else if (type === 'soldier') {
      this.health = 10;
      this.attack = 4;
    } else if (type === 'captain') {
      this.health = 13;
      this.attack = 3;
    } else if (type === 'explorer') {
      this.health = 10;
      this.attack = 1;
    } else if (type === 'builder') {
      this.health = 10;
      this.attack = 1;
    } else {
      this.health = 1;
      this.attack = 1;
    }
  }
}