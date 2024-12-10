// src/Player.ts
export class Player {
  id: number;
  name: string;
  color: string;
  species: string;

  constructor(id: number, name: string, color: string, species: string) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.species = 'Human';
  }
}