# Hi Test Travel Lodge website

Standalone React/Vite app for the `hi-test-travel-lodge-website` GitHub and Vercel projects. The staff app and all Cloud Functions stay in `HMS-HI-TEST-TRAVEL-LODGE`. Both use Firebase project `hi-test-travel-lodge-5166d` and hotel `grand-valley`.

## Run and build

In the standalone website repository: `npm ci`, `npm run dev`, `npm run build`.
In the HMS workspace: `npm run dev:website`, `npm run build:website`.

Copy `.env.example` to `.env.local` for browser configuration. Never add server secrets. Environment files, dependencies and generated builds are ignored by Git. Configure production environment variables in the website Vercel project; its root is `.` because this repository contains the standalone app.

## Customer accounts and booking

Login, registration, password recovery, optional email verification and sign out use Firebase Authentication. Customer signup does not create any staff memberships. Accounts only load their own website reservations through `guestReservations` and `guestReservation`; no private collections are queried by the browser.

Published room categories load through `publicRooms`. Date search uses `publicAvailability`. Select a published room, choose dates, open its details and select **Reserve this room** to sign in and create a temporary hold. A UUID, keyed by a SHA-256 fingerprint of the request and account, persists in session storage for retries. Raw guest details are not stored there. The server transaction owns inventory and prices.

Bank transfer details come from `paymentAccount`. The browser never marks a booking paid. **Check payment status** asks the server to verify, then reloads the server booking status. Accounts include bookings across devices through the owner-scoped history endpoint (up to 50 results). No card details are collected.

## Checks

With Vite running on port 5192: `node scripts/check-ui.mjs` (`WEBSITE_TEST_URL` can override).
For mocked public API and customer flows, start Vite on port 5194 with `VITE_USE_EMULATORS=true`, then run `node scripts/check-backend.mjs` and `node scripts/check-customer.mjs`. These scripts intercept the emulator endpoints and never create production accounts, bookings, messages or payments.

Backend concurrency, payment retry and access-control tests remain in the HMS repository and run against emulators with `npm run test:emulator`.

## Launch status, 16 October 2026

- Separate Vercel projects and GitHub repository links verified.
- Website browser environment configured in Vercel.
- Website domain added to Firebase Auth and the existing Enterprise reCAPTCHA allowlist.
- Customer history callable deployed with owner checks and App Check enforcement.
- Website build and automated customer/public API tests passed.
- All 46 unit tests and 48 backend integration tests passed in the HMS workspace.
- Live login form verified. Automated live App Check attestation was rejected; a successful real-browser booking read is still needed. Protection has not been relaxed.
- Production inventory currently has **zero published room categories**. Do not publish demo room concepts as actual inventory.
- Payment transfers remain **disabled** until merchant-approved configuration and end-to-end verification are completed.
- Real hotel contact details, room photographs, confirmed rates and booking terms still need to replace temporary content.

The website is deployed, but these remaining conditions mean it is not yet ready to accept paid bookings. CLI deployment does not commit or push the local Git changes; commit and push both repositories so later Git deployments keep these changes.

## Images and measurements

All photographs are illustrative Unsplash placeholders, stored under `public/images`. Replace them with hotel photographs and update the labels. Speed Insights uses the React entry point, runs only in production, and removes query strings and fragments from measurement URLs.


## Hero, Google sign-in and customer registration

The hero heading, supporting copy, CTA and image wrapper enter sequentially. Each image stays grouped with its container. Reduced-motion settings disable animation.

Google sign-in is enabled in Firebase and the customer form offers **Continue with Google**. Email/password and Google accounts synchronize to the HMS guest book through the authenticated `syncCustomerProfile` callable. The server uses the authenticated identity, not a browser-supplied UID. Guests show **Website account** even with zero stays; account registration does not grant staff privileges. Repeated syncs are idempotent and preserve reception edits.

## App Check troubleshooting

Local development has a registered debug token in the ignored `.env.local`. Restart Vite after environment changes. Both apps only activate debug attestation when `import.meta.env.DEV` is true. Never put debug tokens in Git or Vercel production environment variables. If changing computers, register a new token under Firebase Console > App Check > web app > Manage debug tokens; set `VITE_APPCHECK_DEBUG_TOKEN` only in the local environment. See https://firebase.google.com/docs/app-check/web/debug-provider.

Verified production configuration: website and HMS domains are allowed; the Enterprise provider and site key match the registered App Check web app. A diagnostic assessment of the automated browser returned a valid token for the website hostname but risk **0**, with reason **UNEXPECTED_ENVIRONMENT**. That explains why automated production attestation is rejected; security thresholds have not been lowered. Test the deployed website in a normal browser without automation, blocking extensions or a VPN. If it still fails, inspect App Check request metrics and the reCAPTCHA assessment reason in the Firebase/Google Cloud consoles before changing any settings.

The local protected room API and debug-token exchange both returned HTTP 200. A headless test rejection is not evidence that a normal customer's browser will fail; production must still be verified in a real customer browser.


## Section motion and test payments

Five numbered chapters share a pinned stage. Chapters 01?03 flow vertically with staggered objects, 04 uses a horizontal wipe, and 05 uses an iris reveal. Lenis snap points apply only inside the chapter track and release into the editorial content. Scrolling backward reverses the transitions. Editorial objects reveal in sequence, with each image and wrapper animated as one unit. Run `node scripts/check-story.mjs` to check snap, reverse motion, responsive layouts and reduced motion.

Paystack test mode was requested. Test activation requires the test secret in the Firebase project's Secret Manager and verified merchant configuration; the account email cannot authenticate API requests. Backend setup instructions live in the HMS repository at `docs/PAYSTACK_SETUP.md`. Payments remain disabled until those requirements are met.

The current design follows the blue and cream boutique lodge reference, adapted to confirmed hotel information and labelled illustrative photography.


## Footer and newsletter

The minimal white footer follows the current lodge reference. Its newsletter action opens a consent-based subscription dialog. No address, phone number, social profile or testimonial was invented.

Newsletter requests use the protected `subscribeNewsletter` endpoint and require explicit consent. They are normalized, deduplicated and rate limited. Status remains `requested`; this does not send marketing or claim an email-verified active subscription. Automatic campaigns require a separate verified mailing setup.

The supplied Paystack test key has been verified and saved securely; a Paystack test transfer capability check succeeded without moving real funds. Booking payment activation and live payments remain disabled pending merchant and webhook verification.


## Stacked room chapter and guest sections

Chapter 02 slides over 01 like a stacked card and reverses on upward scroll. Both room media wrappers print from top to bottom. The numbered pagination pill is removed. Below chapter 05, the room/date calendar, facility fan, illustrative exploration mosaic and clearly labelled demo review layouts follow the supplied references, followed by the booking CTA and minimal multi-column footer. Calendar selections update the real date form; selectable days do not claim availability.


Navigation now uses Home, Rooms, Facilities, About us and Contact. Mobile navigation opens a staggered rounded dropdown with Escape support. Chapter 03 uses the same reversible stacking motion as 02. Facility cards use perspective rather than flat rotation. The continuous review carousel is explicitly fictional demo content, pauses on hover/focus, and becomes manually scrollable for reduced motion.


## Dedicated room browsing

`/rooms` opens the full room catalogue, including direct URL loading and browser Back support. Home room links and searches open this route with a slide transition. Alternating photo/content cards open a keyboard-accessible bottom sheet with grouped room photos, room information and the existing authenticated reservation handoff. Only published room data can be reserved. Preview content remains labelled without inventing amenities or rates. Home availability form and first chapter have sequential entrances; decorative explanatory captions were removed.
