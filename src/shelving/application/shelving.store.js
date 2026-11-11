import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {ShelvingApi} from "../infrastructure/shelving-api.js";
import {ShelfAssembler} from "../infrastructure/shelf.assembler.js";
import {StorageItemAssembler} from "../infrastructure/storage-item.assembler.js";

const shelvingApi = new ShelvingApi();

const useShelvingStore = defineStore('shelving', () => {

  const shelfs = ref([]);

  const storageitems = ref([]);

  const errors = ref([]);

  const shelfsLoaded = ref(false);

  const storageitemsLoaded = ref(false);

  const shelfsCount = computed(() => {
    return shelfsLoaded ? shelfs.value.length : 0;
  })

  const storageitemsCount = computed(() => {
    return storageitemsLoaded ? storageitems.value.length : 0;
  })

  function fetchShelfs() {
    shelvingApi.getShelfs().then(response => {
      shelfs.value = ShelfAssembler.toEntitiesFromResponse(response);
      shelfsLoaded.value = true;
    }).catch(error => {
      errors.value.push(error);
    });
  }

  function fetchStorageItems() {
    shelvingApi.getStorageItems().then(response => {
      storageitems.value = StorageItemAssembler.toEntitiesFromResponse(response);
      storageitemsLoaded.value = true;
    }).catch(error => {
      errors.value.push(error);
    })
  }

  function getShelfsyById(id) {
    let idNum = parseInt(id);
    return shelfs.value.find(shelf => shelf["id"] === idNum);
  }

  function getStorageItemsById(id) {
    let idNum = parseInt(id);
    return storageitems.value.find(storageitem => storageitem["id"] === idNum);
  }

  function addShelf(shelf) {
    shelvingApi.createShelf(shelf).then(response => {
      const resource = response.data;
      const newShelf = ShelfAssembler.toEntityFromResource(resource);
      shelfs.value.push(newShelf);
    }).catch(error => {
      errors.value.push(error);
    });
  }

  function addStorageItem(storageitem) {
    shelvingApi.createStorageItem(storageitem).then(response => {
      const resource = response.data;
      const newStorageItem = StorageItemAssembler.toEntityFromResource(resource);
      storageitems.value.push(newStorageItem);
    }).catch(error => {
      errors.value.push(error);
    });
  }

  return {
    shelfs,
    storageitems,
    errors,
    shelfsLoaded,
    storageitemsLoaded,
    shelfsCount,
    storageitemsCount,
    fetchShelfs,
    fetchStorageItems,
    getShelfsyById,
    getStorageItemsById,
    addShelf,
    addStorageItem
  }
});

export default useShelvingStore;