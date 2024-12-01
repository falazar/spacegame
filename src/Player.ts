// src/Player.ts
export class Player {
  id: number;
  name: string;
  color: string;
  targetX: number | null;
  targetY: number | null;

  constructor(id: number, name: string, color: string) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.targetX = null;
    this.targetY = null;
  }
}