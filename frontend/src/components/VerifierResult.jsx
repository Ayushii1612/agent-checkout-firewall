function VerifierResult({ verification }) {
  const allowed = verification?.allowed;
  return <article className={`result-card verifier-card ${allowed ? 'is-allowed' : 'is-blocked'}`}><div className="card-label"><span className="card-icon">{allowed ? 'OK' : '!!'}</span><span>INDEPENDENT CHECK</span></div><div className="verdict">{allowed ? 'ALLOW' : 'BLOCK'}</div><p>{verification?.reason}</p>{verification?.groundTruth && <div className="ground-truth"><span>CATALOG RECORD</span><strong>#{verification.groundTruth.id} verified</strong></div>}</article>;
}

export default VerifierResult;