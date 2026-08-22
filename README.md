# Agent Checkout Firewall

Agent Checkout Firewall is a verification middleware for agentic commerce. It checks an AI shopping agent's product claims against a ground-truth SQLite catalog before a payment order can be created.

The system is designed around the failure case that matters most in agentic checkout: an agent confidently reports an incorrect price, stock level, specification, or variant. A deterministic verifier catches the mismatch and blocks payment before money moves.

## What It Demonstrates

The application runs this flow for every purchase request:

1. A user submits a natural-language shopping request.
2. The shopping agent selects a product and proposes its claims.
3. The verifier loads the matching catalog record from SQLite.
4. Price, stock, product name, specification, and variant claims are compared with the catalog.
5. If every claim is valid and the product is in stock, the request is allowed.
6. If a claim is wrong, the request is blocked and the UI explains the mismatch.
7. A Razorpay order is created only after verification allows the request.

The frontend displays the decision trail through three live stages:

`Agent Proposal` -> `Ground Truth` -> `Payment Gate`

## Technology

- **Frontend:** React 19, Vite, CSS
- **Backend:** Node.js, Express
- **Database:** SQLite through Node's built-in `node:sqlite` `DatabaseSync` API
- **Agent:** Claude through the Anthropic SDK with tool use
- **Payments:** Razorpay Orders API
- **Development:** `concurrently` for running frontend and backend together

Node.js 22 or newer is required because the backend uses the built-in `node:sqlite` module. Node.js 24 is recommended for this project.

## Project Structure

```text
agent-checkout-firewall/
|-- backend/
|   |-- agent.js       Claude agent, catalog search, and demo scenarios
|   |-- db.js          SQLite connection and products schema
|   |-- package.json   Backend scripts and dependencies
|   |-- razorpay.js    Razorpay order creation and local fallback order
|   |-- seed.js        Catalog seed data
|   |-- server.js      Express API and purchase orchestration
|   `-- verifier.js    Deterministic claim verification rules
|-- data/
|   `-- catalog.db     Generated SQLite database file
|-- frontend/
|   |-- src/
|   |   |-- App.jsx
|   |   |-- App.css
|   |   |-- index.css
|   |   `-- components/
|   |       |-- AgentProposal.jsx
|   |       |-- ChatInput.jsx
|   |       |-- PaymentStatus.jsx
|   |       `-- VerifierResult.jsx
|   |-- index.html
|   `-- package.json
|-- .env
|-- package.json
`-- README.md
```

## Installation

From the repository root:

```powershell
npm install
npm install --prefix backend
npm install --prefix frontend
```

The root install provides `concurrently`, which is used by the combined development command.

## Configuration

The application works in local demo mode with an empty `.env` file:

- The agent uses a deterministic catalog-backed fallback when `ANTHROPIC_API_KEY` is not set.
- The payment layer returns a local demo order when Razorpay credentials are not set.

For live Claude agent calls and Razorpay test-mode orders, add the following values to `.env` in the repository root:

```dotenv
ANTHROPIC_API_KEY=your_anthropic_api_key
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
PORT=5000
```

Use Razorpay test credentials only for development and demos. Do not commit `.env` or expose either secret in the frontend.

## Seed the Database

The database file is created automatically when the backend imports `db.js`. Seed or reset the catalog with:

```powershell
npm run seed --prefix backend
```

The seed script currently inserts 15 products, including running shoes, earbuds, a smartwatch, a backpack, and other demo products. Running the command clears the existing `products` table before inserting the seed records.

## Run the Application

Start both services from the repository root:

```powershell
npm run dev
```

Open the frontend at:

```text
http://localhost:5173
```

The backend listens at:

```text
http://localhost:5000
```

To run either service independently:

```powershell
npm start --prefix backend
npm run dev --prefix frontend
```

If port `5000` or `5173` is already in use, stop the existing process or set `PORT` for the backend and update the frontend API URL in `frontend/src/App.jsx` accordingly.

## Demo Scenarios

The scenario selector makes the important success and failure paths deterministic. Use the default request `I need running shoes under 3000`.

| Scenario | Expected verifier result | Expected payment result |
|---|---|---|
| Accurate claims | `ALLOW` | Order created |
| Wrong price | `BLOCK` | Payment not initiated |
| Wrong stock claim | `BLOCK` | Payment not initiated |
| Hallucinated spec | `BLOCK` | Payment not initiated |

The demo mutations happen after the proposal is produced, so the verifier receives a realistic-looking claim that contains one deliberate error:

- **Wrong price:** subtracts Rs 300 from the claimed price.
- **Wrong stock:** changes the claimed stock to 99 units.
- **Hallucinated spec:** replaces the specification with `Waterproof, solar charging`.

## API

### Health check

```http
GET /api/health
```

Response:

```json
{
	"status": "ok"
}
```

### Purchase verification

```http
POST /api/purchase
Content-Type: application/json
```

Request body:

```json
{
	"query": "I need running shoes under 3000",
	"scenario": "correct"
}
```

Supported `scenario` values are `correct`, `wrong_price`, `wrong_stock`, and `wrong_spec`. The scenario defaults to `correct` when omitted.

Successful response shape:

```json
{
	"proposal": {
		"product_id": 1,
		"product_name": "Running Shoes - Sprint X",
		"claimed_price": 2499,
		"claimed_stock": 12,
		"claimed_spec": "Lightweight mesh, cushioned sole",
		"claimed_variant": "Size 9, Black",
		"reasoning": "..."
	},
	"verification": {
		"allowed": true,
		"reason": "All claims verified against catalog. Safe to proceed.",
		"groundTruth": {
			"id": 1,
			"name": "Running Shoes - Sprint X",
			"price": 2499,
			"stock": 12,
			"spec": "Lightweight mesh, cushioned sole",
			"variant": "Size 9, Black"
		}
	},
	"payment": {
		"status": "created",
		"orderId": "demo_order_...",
		"amount": 249900,
		"currency": "INR",
		"demo": true
	}
}
```

Amounts returned by Razorpay are in paise. For example, `249900` represents Rs 2499.00.

When verification fails, `verification.allowed` is `false`, `payment.status` is `blocked`, and the response includes a specific mismatch reason. No Razorpay order request is made on a blocked path.

Missing or empty requests return HTTP 400:

```json
{
	"error": "query is required"
}
```

## Verification Rules

The verifier rejects a proposal when:

- The agent did not return a valid product ID.
- The product ID does not exist in the catalog.
- The claimed price differs from the catalog price.
- The claimed stock differs from the catalog stock.
- The product is out of stock.
- The claimed product name differs from the catalog name.
- The claimed specification differs from the catalog specification.
- The claimed variant differs from the catalog variant.

The comparison is deterministic and independent of the LLM. This is intentional: the component deciding whether real payment can proceed should be inspectable and reproducible.

## Validation Commands

Build and lint the frontend:

```powershell
npm run build --prefix frontend
npm run lint --prefix frontend
```

Verify the catalog:

```powershell
npm run seed --prefix backend
```

Check the backend health endpoint while the server is running:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

Expected output:

```text
status
------
ok
```

## Troubleshooting

### `concurrently` is not recognized

Install the root dependencies:

```powershell
npm install
```

Then run `npm run dev` again.

### `EADDRINUSE` on port 5000

Another backend process is already listening on port 5000. Reuse that running server, stop it, or choose another port:

```powershell
$env:PORT=5001
npm start --prefix backend
```

If the backend moves to another port, update the fetch URL in `frontend/src/App.jsx`.

### Claude or Razorpay credentials are missing

This is supported for local demos. Claude falls back to a catalog-backed proposal and Razorpay returns a local demo order. Add valid test credentials to `.env` when you need to exercise the external integrations.

### The catalog is empty

Run:

```powershell
npm run seed --prefix backend
```

## Security Notes

- Keep Anthropic and Razorpay secrets on the backend.
- Use Razorpay test mode for development.
- Treat the client proposal as untrusted input; the backend verifier is the authority.
- Do not allow a frontend-only `ALLOW` decision to trigger payment.
- The demo fallback order is not a real charge and should not be treated as payment confirmation.

## License

See [LICENSE](LICENSE).
