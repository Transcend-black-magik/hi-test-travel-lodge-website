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

The welcome line, hotel name, description, CTA and main image have independent, staggered load animations. Reduced-motion settings disable them.

Google sign-in is enabled in Firebase and the customer form offers **Continue with Google**. Email/password and Google accounts synchronize to the HMS guest book through the authenticated `syncCustomerProfile` callable. The server uses the authenticated identity, not a browser-supplied UID. Guests show **Website account** even with zero stays; account registration does not grant staff privileges. Repeated syncs are idempotent and preserve reception edits.

## App Check troubleshooting

Local development has a registered debug token in the ignored `.env.local`. Restart Vite after environment changes. Both apps only activate debug attestation when `import.meta.env.DEV` is true. Never put debug tokens in Git or Vercel production environment variables. If changing computers, register a new token under Firebase Console > App Check > web app > Manage debug tokens; set `VITE_APPCHECK_DEBUG_TOKEN` only in the local environment. See https://firebase.google.com/docs/app-check/web/debug-provider.

Verified production configuration: website and HMS domains are allowed; the Enterprise provider and site key match the registered App Check web app. A diagnostic assessment of the automated browser returned a valid token for the website hostname but risk **0**, with reason **UNEXPECTED_ENVIRONMENT**. That explains why automated production attestation is rejected; security thresholds have not been lowered. Test the deployed website in a normal browser without automation, blocking extensions or a VPN. If it still fails, inspect App Check request metrics and the reCAPTCHA assessment reason in the Firebase/Google Cloud consoles before changing any settings.

The local protected room API and debug-token exchange both returned HTTP 200. A headless test rejection is not evidence that a normal customer's browser will fail; production must still be verified in a real customer browser.


## Section motion and test payments

Rooms use image masks and staggered reveals, dining uses side entrances, comfort uses soft focus/zoom, and booking uses staggered card lifts. The header and reduced-motion behavior remain intact.

Paystack test mode was requested. Test activation requires the test secret in the Firebase project's Secret Manager and verified merchant configuration; the account email cannot authenticate API requests. Backend setup instructions live in the HMS repository at `docs/PAYSTACK_SETUP.md`. Payments remain disabled until those requirements are met.

The updated footer reference was not attached to the request, so its existing layout is preserved pending the image.


## Footer and newsletter

The footer follows the supplied dark hotel reference, with an illustrative five-image ribbon, subscription form, hotel wordmark, navigation and contact sections. No address, phone number, social profile or testimonial was invented. Supply public contact settings to show the actual details.

Newsletter requests use the protected `subscribeNewsletter` endpoint and require explicit consent. They are normalized, deduplicated and rate limited. Status remains `requested`; this does not send marketing or claim an email-verified active subscription. Automatic campaigns require a separate verified mailing setup.

The supplied Paystack test key has been verified and saved securely; a Paystack test transfer capability check succeeded without moving real funds. Booking payment activation and live payments remain disabled pending merchant and webhook verification.
