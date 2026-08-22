const Anthropic = require('@anthropic-ai/sdk');
const db = require('./db');

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

function searchCatalog(query) {
  return db.prepare(`SELECT * FROM products WHERE name LIKE ?`).all(`%${query}%`);
}

function localProposal(userQuery) {
  const keywords = userQuery.toLowerCase().split(/\s+/).filter(Boolean);
  const products = db.prepare('SELECT * FROM products ORDER BY id').all();
  const product = products.find(item =>
    keywords.some(keyword => keyword.length > 2 && item.name.toLowerCase().includes(keyword))
  ) || products[0];

  if (!product) return { error: 'The product catalog is empty.' };

  return {
    product_id: product.id,
    product_name: product.name,
    claimed_price: product.price,
    claimed_stock: product.stock,
    claimed_spec: product.spec,
    claimed_variant: product.variant,
    reasoning: `Selected ${product.name} from the ground-truth catalog.`
  };
}

const tools = [
  {
    name: 'search_catalog',
    description: 'Search the product catalog by keyword (product name or category).',
    input_schema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Search keyword' } },
      required: ['query']
    }
  }
];

async function runAgent(userQuery, scenario = 'correct') {
  if (!anthropic) return applyScenario(localProposal(userQuery), scenario);

  const systemPrompt = `You are a shopping assistant. Use the search_catalog tool to find products matching the user's request.
Once you find a suitable product, respond with ONLY a JSON object (no other text) in this exact format:
{
  "product_id": <id>,
  "product_name": "<name>",
  "claimed_price": <price>,
  "claimed_stock": <stock>,
  "claimed_spec": "<spec>",
  "claimed_variant": "<variant>",
  "reasoning": "<why you picked this>"
}`;

  let messages = [{ role: 'user', content: userQuery }];
  let finalProposal = null;

  for (let i = 0; i < 4; i++) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages
    });

    const toolUse = response.content.find(b => b.type === 'tool_use');
    const text = response.content.find(b => b.type === 'text');

    if (toolUse && toolUse.name === 'search_catalog') {
      const results = searchCatalog(toolUse.input.query);
      messages.push({ role: 'assistant', content: response.content });
      messages.push({
        role: 'user',
        content: [{ type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(results) }]
      });
      continue;
    }

    if (text) {
      try {
        finalProposal = JSON.parse(text.text.trim());
      } catch (e) {
        finalProposal = { error: 'Could not parse agent response', raw: text.text };
      }
      break;
    }
  }

  if (!finalProposal) finalProposal = { error: 'Agent did not return a proposal' };

  return applyScenario(finalProposal, scenario);
}

function applyScenario(proposal, scenario) {
  // DEMO MODE: deliberately corrupt the claim to simulate hallucination scenarios
  if (scenario === 'wrong_price' && proposal.claimed_price) {
    proposal.claimed_price = proposal.claimed_price - 300;
  }
  if (scenario === 'wrong_stock' && proposal.product_id) {
    proposal.claimed_stock = 99;
  }
  if (scenario === 'wrong_spec' && proposal.product_id) {
    proposal.claimed_spec = 'Waterproof, solar charging';
  }

  return proposal;
}

module.exports = { runAgent };