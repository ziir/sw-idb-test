(() => {
  if ('serviceWorker' in window.navigator && window.indexedDB) {
    window.navigator.serviceWorker.register(
      '/domain/service-worker.js',
    )
    .then((registration) => {
      console.log('serviceWorker is registered', registration);
    })

    // we don't need any kind of error handling here, just swallow the error.
    .catch(() => {});

    let db;

    const getStore = () => {
      return db
        .transaction('preferences', 'readwrite')
        .objectStore('preferences');
    }

    // request.onerror / request.onsuccess
    // We do not care much for success or error cases here.
    // "fire-and-forget" style.
    const doSetItem = (item) => getStore().put(item);
    const doDeleteItem = (key) => getStore().delete(key);

    const init = (callback, ...args) => {
      try {
        if (!db) {
          // Open the `adminv5` database, version 1. Returns a IDBOpenDBRequest
          const openRequest = window.indexedDB.open('adminv5', 1);

          // Store a reference of the database
          openRequest.onsuccess = () => {
            db = openRequest.result;
            callback(...args);
          };

          // Handle first creation of stores within database, or version update
          openRequest.onupgradeneeded = (event) => {
            // Note: `key` value **must* be unique
            event.target.result.createObjectStore(
              'preferences',
              { keyPath: 'key' }
            );
          };
        } else {
          callback(...args);
        }
      } catch (err) {}
    }

    const setItem = (item) => init(doSetItem, item);
    const deleteItem = (key) => init(doDeleteItem, key);

    document.addEventListener('click', (evt) => {
      if (evt.target.tagName === 'A' && evt.button === 0 && !(evt.ctrlKey)) {
        evt.preventDefault();
        history.pushState(
          {},
          evt.target.textContent,
          new URL(`${evt.target.href}`).pathname
        );
      }
    });

    window.onbeforeunload = () => {
      const isTable = `${window.location.href}`.includes('/table');
      if (isTable) {
        setItem({ key: 'created-domains-view', value: 'table' });
      } else {
        deleteItem('created-domains-view');
      }
    };

    deleteItem('created-domains-view');
  }
})();
