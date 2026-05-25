# Install and update flow

How the user installs the PWA and how updates roll out.

## Install eligibility — what the browser requires

A browser shows the install prompt only when **all** of these are true:

- The site is served over HTTPS (localhost exempted in dev).
- A valid Web App Manifest is linked.
- The manifest has `name`, `short_name`, `start_url`, `display: 'standalone'` (or fullscreen/minimal-ui), and icons of at least 192×192 and 512×512.
- A registered Service Worker with a `fetch` handler (Serwist provides this).
- The user has had **at least one engaging interaction** with the site (this rule varies — Chrome requires user engagement; some browsers don't).

When all are true and the browser decides the user is engaged, it fires `beforeinstallprompt`. Our `PwaUpdater` captures it, suppresses the browser's default mini-infobar, and surfaces an in-app install button.

## Why we don't auto-prompt aggressively

Browsers used to auto-prompt and users hated it. Now they're cautious. `beforeinstallprompt` fires but we have to *let the user choose to install*. The UX:

1. User uses the site normally.
2. After enough engagement, the browser fires `beforeinstallprompt`.
3. PwaUpdater shows a small, dismissable bar with "Install" and "Not now".
4. If the user clicks Install, we call `event.prompt()` — the OS-native install dialog appears.
5. We capture the user's choice (`accepted` / `dismissed`) and dismiss our bar regardless.

Critically: **the install prompt event can only be used once per page load**. After `prompt()` resolves, the event is dead. PwaUpdater clears it from state when used.

## iOS install — the manual path

iOS Safari doesn't fire `beforeinstallprompt`. iOS users add to home screen via Share → Add to Home Screen. PwaUpdater doesn't show its install button on iOS because there's nothing to call.

If a project wants to nudge iOS users explicitly, add a separate iOS-only hint component that uses `isIOS()` and shows the share-menu instructions. We don't ship this by default — most products don't need it.

## Update flow — how new SW versions roll out

Service Workers update on a strict lifecycle:

```
1. Browser fetches the SW file on each navigation (cache-busted by default).
2. If the new SW differs from the installed one, the new one starts installing.
3. After install, the new SW enters "waiting" state.
4. The new SW activates ONLY when:
   - All open pages controlled by the old SW are closed, OR
   - The new SW calls skipWaiting()
5. After activation, the new SW takes over future requests.
   With clientsClaim: true (our config), it claims open pages too.
```

We use `skipWaiting: false` in the config — so updates wait politely instead of force-activating mid-page. That's where PwaUpdater's "Reload" prompt comes in.

### What PwaUpdater does

When PwaUpdater detects a waiting SW:

1. Shows the "A new version is available. [Reload]" pill.
2. On click, it sends `{ type: 'SKIP_WAITING' }` to the waiting SW. The SW's `message` handler (added by Serwist) calls `self.skipWaiting()`.
3. The new SW activates. Because `clientsClaim: true`, it takes control of the open page.
4. A `controllerchange` event fires. PwaUpdater's listener reloads the page once.

The result: the user clicks Reload, the page reloads, they're on the new version.

### What happens if the user ignores the update?

Nothing breaks. The user stays on the old version until they close all tabs (which lets the new SW activate naturally on next visit) or until they reload at some other moment. The new SW just sits patiently.

### What if the SW file 404s after a deploy?

Browsers automatically unregister Service Workers when their SW file returns 404 or otherwise becomes unfetchable. The user falls back to "no SW" mode (regular network) until you redeploy. This is a fail-safe.

### How fast do updates propagate?

Browsers check for SW updates on every navigation in the controlled scope, with a server-side cache check first. With a deployed update:

- A user already on the site sees the "new version available" pill within seconds-to-minutes (depending on their navigation pattern and HTTP cache headers).
- A user visiting fresh starts on the new SW immediately.

To ensure updates are detected fast, set the SW file's response to short caching (`Cache-Control: max-age=0, must-revalidate`). Serwist's default response headers handle this; in deployment configs, just make sure your CDN isn't overriding it.

## Push notification readiness

The SW in `sw.ts` includes push and notification-click handlers. They're inert until the project:

1. Generates a VAPID key pair.
2. Adds a backend endpoint to receive push subscriptions.
3. Calls `pushManager.subscribe()` from a client component, sending the subscription to the backend.
4. The backend sends pushes via the Web Push protocol.

We don't wire push by default because it's a real product decision (when to ask for permission, what notifications to send, how to manage unsubscribes). Add it per-project when needed. The SW is structured to handle it the moment a project switches on.

## Testing the flow

End-to-end install test:

1. Build prod (`npm run build && npm run start`).
2. Open in Chrome.
3. DevTools → Application → Manifest. Confirm "Installability" is "Installable".
4. Click around enough to trigger engagement.
5. The PwaUpdater install pill should appear.
6. Click Install. Confirm the OS install dialog appears.
7. Install. Confirm the app opens in its own window.

End-to-end update test:

1. Install the SW (visit, let it register).
2. Change something in `sw.ts` (e.g. bump a comment).
3. Rebuild and reload.
4. Open DevTools → Application → Service Workers. Confirm "waiting to activate" appears.
5. The PwaUpdater reload pill should appear.
6. Click Reload. Page should reload on the new SW.
