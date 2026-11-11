export class StorageItem  {

  constructor({ id = null, shelfId = '', gameGenre = '', gameId = null, gameTitle = '', status = '', quantity = null, registeredAt = null }) {
    this.id = id;
    this.shelfId = shelfId;
    this.gameGenre = gameGenre;
    this.gameId = gameId;
    this.gameTitle = gameTitle;
    this.status = status;
    this.quantity = quantity;
    this.registeredAt = registeredAt;
  }
}