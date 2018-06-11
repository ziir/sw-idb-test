# sw-idb-test
Just a quick service worker + indexedDB test

## Install

Clone the repo.

## Run

```
$ python -m SimpleHTTPServer 3000
```

## Test

- Open new tab
- Open devtools
- Navigate to `http://localhost:3000/domain/8ce07960-a4fe-4a26-b479-dc84c9cf8290`
- Click on `TABLE` link
- Close the tab

- Open new tab
- Open devtools
- Navigate to `http://localhost:3000/domain/8ce07960-a4fe-4a26-b479-dc84c9cf8290`
- Observe 302 redirect to `http://localhost:3000/domain/8ce07960-a4fe-4a26-b479-dc84c9cf8290/table`

