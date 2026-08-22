function AgentProposal({ proposal }) {
  return <article className="result-card proposal-card"><div className="card-label"><span className="card-icon agent-icon">AI</span><span>AGENT CLAIM</span></div>{proposal?.error ? <p className="card-error">{proposal.error}</p> : <><h3>{proposal.product_name}</h3><dl><div><dt>PRICE</dt><dd>Rs {proposal.claimed_price}</dd></div><div><dt>STOCK</dt><dd>{proposal.claimed_stock} units</dd></div><div><dt>SPEC</dt><dd>{proposal.claimed_spec}</dd></div><div><dt>VARIANT</dt><dd>{proposal.claimed_variant}</dd></div></dl>{proposal.reasoning && <p className="reasoning">&ldquo;{proposal.reasoning}&rdquo;</p>}</>}</article>;
}

export default AgentProposal;