export class Shelf  {

  constructor({ id = null, name = '', gameGenre = '', capacity = null }) {
    this.id = id;
    this.name = name;
    this.gameGenre = gameGenre;
    this.capacity = capacity;
  }
}
