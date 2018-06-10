const uuidRE = new RegExp(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
);

let db;
const getStore = () => db
  .transaction('preferences', 'readwrite')
  .objectStore('preferences');

const doGetItem = (key) => new Promise((resolve, reject) => {
  const preferences = getStore();

  const request = preferences.get(key);
  request.onsuccess = (evt) =>
    resolve(evt.target.result && evt.target.result.value);
  request.onerror = () => resolve();
});

const doDeleteItem = (key) => new Promise((resolve, reject) => {
  const preferences = getStore();

  const request = preferences.delete(key);
  request.onsuccess = (event) => resolve();
  request.onerror = () => resolve();
});

const init = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      // Open the `adminv5` database, version 1. Returns a IDBOpenDBRequest
      const openRequest = self.indexedDB.open('adminv5', 1);

      // Store a reference of the database
      openRequest.onsuccess = () => {
        db = openRequest.result;
        resolve();
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
      resolve();
    }
  });
}

const getItem = (key) => init().then(() => doGetItem(key));
const deleteItem = (key) => init().then(() => doDeleteItem(key));

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') {
    const pathname =
      new URL(event.request.url).pathname.replace('/domain/', '');
    const sharingId = pathname.split('/')[0].split(/[?#]/)[0];
    const isSharingId = sharingId.match(uuidRE);
    const isOnRootPath = !pathname.replace(sharingId, '').replace(/^\//, '');

    // /domains/:sharingId[/]
    if (isSharingId && isOnRootPath) {
      event.respondWith(
        getItem('created-domains-view')
          .then((pref) => pref === 'table'
              ? deleteItem('created-domains-view')
              : Promise.reject()
          )
          .then(() => {
            const redirectTo = `/${new URL(event.request.url).pathname
              .split('/')
              .filter(Boolean)
              .concat('table.html')
              .join('/')
            }`;

            return new Response(
              null,
              {
                status: 302,
                headers: {
                  'Cache-Control': 'no-cache',
                  'Location': `${redirectTo}`,
                },
              }
            );
          })
          .catch((err) => fetch(event.request))
      );
    }
    return;
  }
  event.respondWith(fetch(event.request));
});
