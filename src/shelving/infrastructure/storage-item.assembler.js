import {StorageItem} from "../domain/model/storage-item.entity.js";

export class StorageItemAssembler {

  static toEntityFromResource(resource) {
    return new StorageItem({...resource});
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status} - ${response.statusText}`);
      return [];
    }
    let resources = response.data instanceof Array ? response.data
        : response.data['storageitems'];
    return resources.map(resource => this.toEntityFromResource(resource));
  }
}