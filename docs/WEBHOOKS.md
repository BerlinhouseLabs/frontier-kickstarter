# Webhooks for Third-Party Apps

Webhooks let our API *push* events to you the moment something changes. Hollywood principle: Don't call us - we call you.

This guide is written to be read in order:
- start by getting access,
- then create an app,
- then create a webhook,
- then verify deliveries.

## Table of contents

- [The mental model](#the-mental-model)
- [Quickstart (end-to-end)](#quickstart-end-to-end)
- [Authentication](#authentication)
- [Developers: profiles + API keys](#developers-profiles--api-keys)
- [Apps: lifecycle + deactivation](#apps-lifecycle--deactivation)
- [Webhooks: create, review, and rotate keys](#webhooks-create-review-and-rotate-keys)
- [Events](#events)
- [Delivery format (payload + headers)](#delivery-format-payload--headers)
- [Verifying signatures (Ed25519)](#verifying-signatures-ed25519)
- [Operational tips](#operational-tips)

## The mental model

Everything hangs off a few core objects:

- **Developer**
  Owns the API key (`X-API-Key`). A developer can manage multiple apps and webhooks.
- **App**
  The “product” you’re building. Apps go through review before they’re released.
- **Webhook**
  A subscription + target URL. Webhooks go through review and only receive deliveries when `LIVE`.
- **Delivery**
  A single HTTP `POST` we send to your endpoint for one event.

## Quickstart (end-to-end)

If you want the “happy path” in one place:

1. **Get developer access**
   Our account team adds you as a developer manager. Just shoot an email to [support@frontiertower.io](mailto:support@frontiertower.io) to get started.
2. **Get your developer profile**
   Go to the FrontierOS AppStore and install `OS Developer`. It has your developer profile and lets you manage apps, webhooks and keys in a convenient way.
4. **Create an app**
   App creation can be done in the OS Developer app, but API instructions follow below as well.
5. **Create and manage webhooks**
   Webhook creation and management can be done in the OS Developer app, but API instructions follow below as well.
6. **Implement verification**
   Verify every request using the webhook’s Ed25519 public key.
7. **Go live**
   After review, your webhook becomes `LIVE` and starts receiving deliveries.

## Authentication

Third-party endpoints accept ...

- **Developer API key** via `X-API-Key`
  This key belongs to the **developer profile** (not an individual app).


## Developers: profiles + API keys

### View and update your developer profile

- `GET /third-party/developers/`
  List developer profiles you can manage.
- `GET /third-party/developers/{developer_id}/`
  Retrieve a specific developer profile.
- `PATCH /third-party/developers/{developer_id}/`
  Update contact details like name, email, and description.

### Rotate your developer API key

- `POST /third-party/developers/{developer_id}/rotate-key/`

Notes:

- The response returns the new key in full **once**.
- Rotating the key invalidates the previous key immediately.
- Store it like you would any production secret (environment variables or a secret store).

## Apps: lifecycle + deactivation

### Create an app

The recommended way is to use the OS Developer app, but you can also use the API.

- `POST /third-party/apps/`

Provide app metadata (`name`, `url`, `description`, optional DNS entries).

New apps start in **`in_review`**.

### App status lifecycle

Apps move through review gates:

- `in_review`
  Default after creation or updates.
- `accepted`
  Approved; waiting for release.
- `released`
  Live and visible to users.
- `request_deactivation`
  Deactivation requested (used instead of hard-delete for released apps).
- `deactivated`
  Fully disabled.
- `rejected`
  Not approved.

Important behavior:

- Updating an app returns it to `in_review`.
- Deleting a **released** app does not hard-delete; it sets `request_deactivation` and we will  deactivate it in the next release cycle.

## Webhooks: create, review, and rotate keys

### Webhook status lifecycle

Webhooks only receive traffic when their status is:

- `LIVE`

Other states you’ll see:

- `IN_REVIEW` (default)
- `REJECTED`

### Create or update a webhook

- Create: `POST /third-party/webhooks/`
- Update: `PATCH /third-party/webhooks/{webhook_id}/`

Example payload:

```json
{
  "name": "Billing events",
  "target_url": "https://example.com/webhooks",
  "config": {
    "events": ["event:*"],
    "scope": { "communities": [10], "users": "*" }
  }
}
```

Notes:

- Any config change moves the webhook back to `IN_REVIEW`.
- Status changes to `LIVE` or `REJECTED` happen after review.

### Rotate webhook signing keys

- `POST /third-party/webhooks/{webhook_id}/rotate-key/`

This generates a new Ed25519 key pair. Deliveries immediately use the new private key, and the response contains the new public key.

Make sure your receiver always trusts the **latest** public key for that webhook.

## Events

Events use the format `namespace:action`.

Subscriptions support:

- explicit values (example: `event:created`)
- patterns (examples: `event:*` or `*`)

Namespaces include:

- `addon_product`, `addon`
- `community`, `guest_check_in`, `internship_pass`, `supply_request`
- `event`, `location`, `room_booking`
- `sponsor`, `sponsor_pass`
- `smart_account`, `bridge_account`, `recovery_request`, `required_signature`
- `post`, `citizen_suggestion`, `vote`
- `developer`, `app`, `webhook`, `user`, `profile`, `subscription`

## Delivery format (payload + headers)

Each delivery is an HTTP `POST` with a JSON body:

```json
{
  "id": "{delivery_uuid}",
  "event": "namespace:action",
  "triggered_at": "2024-01-01T12:00:00Z",
  "data": { /* event payload */ }
}
```

Headers sent with every delivery:

- `Content-Type: application/json`
- `X-Webhook-Event`
- `X-Webhook-Id`
- `X-Webhook-Timestamp`
- `X-Webhook-Signature`
- `X-Webhook-Signature-Algorithm: ed25519`

### Scope context

Event payloads include a context map used for filtering against your webhook `config.scope`.

Examples by namespace:

- addon_product: `{ "addon_products": [product_id] }`
- addon: `{ "addons": [addon_id], "users": [user_id], "addon_products": [product_id] }`
- community: `{ "communities": [community_id] }`
- event: `{ "events": [event_id], "communities": [community_id] }`
- location: `{ "locations": [location_id], "communities": [owner_id] }`
- room_booking: `{ "room_bookings": [booking_id], "locations": [location_id], "users": [host_id] }`
- sponsor: `{ "sponsors": [sponsor_id] }`
- sponsor_pass: `{ "sponsor_passes": [pass_id], "sponsors": [sponsor_id] }`
- smart_account: `{ "smart_accounts": [account_id], "users": [user_id] }`
- bridge_account: `{ "bridge_accounts": [bridge_account_id], "users": [user_id] }`
- recovery_request: `{ "recovery_requests": [request_id], "users": [user_id] }`
- required_signature: `{ "required_signatures": [signature_id], "users": [user_id] }`
- post: `{ "posts": [post_id], "users": [creator_id] }`
- citizen_suggestion: `{ "citizen_suggestions": [suggestion_id], "users": [creator_id] }`
- vote: `{ "votes": [vote_id], "citizen_suggestions": [suggestion_id], "users": [voter_id] }`
- guest_check_in: `{ "guest_check_ins": [guest_check_in_id], "users": [host_id] }`
- internship_pass: `{ "internship_passes": [pass_id], "communities": [community_id] }`
- supply_request: `{ "supply_requests": [request_id], "users": [user_id] }`

## Verifying signatures (Ed25519)

You should verify *every* delivery before processing it.

### Signature verification steps

1. Read `X-Webhook-Timestamp` from the request.
2. Build the message as:

   `X-Webhook-Timestamp + "." + canonical_json_body`

   where `canonical_json_body` means JSON with sorted keys and no extra spaces.
3. Verify `X-Webhook-Signature` (base64) using the webhook’s Ed25519 public key.
4. Reject the request if verification fails, the timestamp is too old, or the event is unexpected.

Python example using `cryptography`:

```python
import base64, json
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

body = request.get_json(force=True)
timestamp = request.headers["X-Webhook-Timestamp"]
signature = base64.b64decode(request.headers["X-Webhook-Signature"])
message = f"{timestamp}.".encode() + json.dumps(body, separators=(",", ":"), sort_keys=True).encode()

public_key = Ed25519PublicKey.from_public_bytes(base64.b64decode(PUBLIC_KEY_FROM_WEBHOOK_SETUP))
public_key.verify(signature, message)  # Raises if invalid
```

### Minimal receiver pattern

```python
from flask import Flask, request, abort
app = Flask(__name__)

@app.post("/webhooks")
def receive():
    try:
        verify_signature(request)  # Implement as above
    except Exception:
        abort(400)

    event = request.headers.get("X-Webhook-Event")
    payload = request.get_json(force=True)
    # Process event safely and idempotently using payload["id"]
    return {"received": True}
```

## Operational tips

- Use HTTPS endpoints only.
- Treat `X-Webhook-Id` as an idempotency key to avoid double-processing.
- Keep one webhook per environment (staging vs production) to avoid cross-traffic.
- Rotate webhook signing keys and developer API keys regularly (and immediately if you suspect exposure).
