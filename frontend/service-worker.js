self.addEventListener("install", (event) => {
  console.log("Service worker installed.", event);
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activated.", event);
});

self.addEventListener("fetch", (event) => {
  console.log("fetch!", event);
});

self.addEventListener("sync", (event) => {
  console.log("sync!", event);
});

self.addEventListener("push", (event) => {
  console.log("push!", event);
});
