// ServiceWorker処理：https://developers.google.com/web/fundamentals/primers/service-workers/?hl=ja

// キャッシュ名とキャッシュファイルの指定
var CACHE_NAME = 'sample-service-caches-v1';
var urlsToCache = [
	'index.html',
	'manifest.json',
	'sw.js',
	'images/app-icon-192.png',
	'css/style.css'
];

// インストール(≒ファイルをキャッシュする)処理
self.addEventListener('install', function(event) {
	event.waitUntil(
		// キャッシュをopenして、キャッシュファイルのパスのリストをaddAllしている
		caches
			.open(CACHE_NAME)
			.then(function(cache) {
				console.log('ローカルにデータをキャッシュします');
				return cache.addAll(urlsToCache);
			})
	);
});

// リソースフェッチ時のキャッシュロード(≒キャッシュを返す)処理
self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches
			.match(event.request)
			.then(function(response) {
				if(response) {
					console.log('サーバーからのデータを表示します');
					return response;
				} else {
					// キャッシュがなければリクエストを投げて、キャッシュをレスポンスに入れる
					return fetch(event.request)
						.then(function(res) {
							return cache.open(CACHE_NAME)
								.then(function(cache) {
									// 最後にresを返せるように、ここではclone()をする必要がある
									cache.put(event.request.url, res.clone());
									console.log('キャッシュからのデータを表示します');
									return res;
								})
						})
						.catch(function() {
							// エラーが発生しても何もしない
						});
				}
			})
	);
});

// 新しいバージョンのキャッシュがあったら古いキャッシュを削除
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_NAME && key !== CACHE_NAME) {
            console.log('古いキャッシュを削除します');
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});
