
/// <reference lib="webworker" />

import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL
} from "workbox-precaching";

import {
  NavigationRoute,
  registerRoute
} from "workbox-routing";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{
    url: string;
    revision?: string | null;
  }>;
};

// Cache all built application resources.
precacheAndRoute(self.__WB_MANIFEST);

// Remove outdated Workbox precache versions.
cleanupOutdatedCaches();

// Offline fallback for application navigation.
const navigationHandler =
  createHandlerBoundToURL("index.html");

registerRoute(
  new NavigationRoute(navigationHandler)
);

// Activate the new service worker after installation.
// The new worker will take control when the existing
// service worker clients are ready to be claimed.
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
