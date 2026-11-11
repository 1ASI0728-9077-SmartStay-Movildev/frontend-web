import {Shelf} from "../domain/model/shelf.entity.js";

export class ShelfAssembler {

  static toEntityFromResource(resource) {
    return new Shelf({...resource});
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status} - ${response.statusText}`);
      return [];
    }
    let resources = response.data instanceof Array ? response.data
        : response.data['shelfs'];
    return resources.map(resource => this.toEntityFromResource(resource));
  }
}