"use strict";

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open("neon").then(cache => cache.addAll([
            "/",
            "/index.html",
            "/css/main.css",
            "/js/main.js",
            "/js/todo.js",
            "/js/modal.js",
            "/js/task.js",
            "/js/storage.js",
            "/js/util.js",
            "/js/requestDB.js",
            "/js/adapters/indexDBAdapter.js",
            "/js/adapters/localAdapter.js",
            "/js/adapters/restAdapter.js",
            "/js/offline.js",
            "/node_modules/bootstrap/dist/js/bootstrap.min.js",
            "/node_modules/bootstrap/dist/css/bootstrap.min.css",
            "/node_modules/jquery/dist/jquery.min.js",
            "/vendors/uuid.js",
            "/assets/wasp-icon.png",
            "/assets/wasp-logo-full.png",
            "/assets/wasp-logo.png",
            "/assets/reload.png",
            "/manifest.json",
            "/vendors/material-icon.woff2"
        ]))
    );
});

self.addEventListener("fetch", event => {
    if (event.request.url !== "https://todo-server.fabnum.intradef.gouv.fr:8443/sse") {
        event.respondWith(
            caches.match(event.request).then(response => response || fetch(event.request))
        );
    }
});
