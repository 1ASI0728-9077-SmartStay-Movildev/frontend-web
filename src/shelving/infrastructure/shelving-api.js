import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const shelfesEndpointPath         = import.meta.env.VITE_SHELFS_ENDPOINT_PATH;
const storageitemsEndpointPath    = import.meta.env.VITE_STORAGEITEMS_ENDPOINT_PATH;

export class ShelvingApi extends BaseApi {
  #shelfesEndpoint;
  #storageitemsEndpoint;

  constructor() {
    super();
    this.#shelfesEndpoint = new BaseEndpoint(this, shelfesEndpointPath);
    this.#storageitemsEndpoint = new BaseEndpoint(this, storageitemsEndpointPath);
  }

  getShelfes() {
    return this.#shelfesEndpoint.getAll();
  }

  getShelfesyById(id) {
    return this.#shelfesEndpoint.getById(id);
  }

  getStorageItems() {
    return this.#storageitemsEndpoint.getAll();
  }

  getStorageItemsById(id) {
    return this.#storageitemsEndpoint.getById(id);
  }

  /**getCategories() {
   return this.#categoriesEndpoint.getAll();
   }

   getCategoryById(id) {
   return this.#categoriesEndpoint.getById(id);
   }

   createCategory(resource) {
   return this.#categoriesEndpoint.create(resource);
   }

   updateCategory(resource) {
   return this.#categoriesEndpoint.update(resource.id, resource);
   }

   deleteCategory(id) {
   return this.#categoriesEndpoint.delete(id);
   }*/

}