export class Planet {
  id: number;
  name: string;
  color: string;
  image: string;
  size: number; // diameter of planet 1-9?
  radius: number; // orbit radius
  x: number;
  y: number;
  // description.
  // inhabited?
  // todo starSystem id
  // todo resources.
  // todo angle of orbit position.
  // todo orbit speed.
  // todo moons - show only if partial zoom in.

  constructor(id: number, name: string, color: string, image: string, size: number, radius: number) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.image = 'TEST';
    this.size = size;
    this.radius = radius;
    this.x = 0;
    this.y = 0;
  }
}