import { useState } from 'react';
import './App.css';
import ChatInput from './components/ChatInput';
import AgentProposal from './components/AgentProposal';
import VerifierResult from './components/VerifierResult';
import PaymentStatus from './components/PaymentStatus';

function wait(duration) {
	return new Promise(resolve => setTimeout(resolve, duration));
}

function PipelineStep({ number, label, phase, progress }) {
	const phases = ['agent', 'truth', 'payment'];
	const currentIndex = phases.indexOf(progress);
	const phaseIndex = phases.indexOf(phase);
	const complete = progress === 'complete' || (currentIndex > phaseIndex && currentIndex !== -1);
	const current = progress === phase;

	return <div className={`pipeline-step ${complete ? 'complete' : ''} ${current ? 'current' : ''}`}><b>{complete ? 'OK' : number}</b><span>{label}</span></div>;
}

function App() {
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);
	const [progress, setProgress] = useState('idle');

	async function handleSubmit(query, scenario) {
		setLoading(true);
		setError(null);
		setResult(null);
		setProgress('agent');

		try {
			const response = await fetch('http://localhost:5000/api/purchase', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query, scenario })
			});
			const data = await response.json();
			if (!response.ok || data.error) throw new Error(data.error || 'Request failed');
			setProgress('truth');
			await wait(350);
			setProgress('payment');
			await wait(350);
			setResult(data);
			setProgress('complete');
		} catch (requestError) {
			setError(requestError.message);
			setProgress('error');
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="app-shell">
			<nav className="topbar"><div className="brand"><span className="brand-mark">AF</span><span>Agent Firewall</span></div><div className="system-status"><span className="status-dot" /> SYSTEM ONLINE</div></nav>
			<section className="hero"><div className="eyebrow">TRUST LAYER / CHECKOUT CONTROL</div><h1>Let agents shop.<br /><em>Make them prove it.</em></h1><p className="hero-copy">An independent verification checkpoint catches incorrect prices, stock claims, and product specs before payment can move.</p></section>
			<section className="workspace">
				<div className="request-panel"><div className="panel-heading"><span>01</span><div><h2>Shopping request</h2><p>Give the agent a product brief to work from.</p></div></div><ChatInput onSubmit={handleSubmit} loading={loading} /><div className="trust-note"><span>i</span> Every claim is checked against the catalog, independently of the agent.</div></div>
				<div className="pipeline" aria-label="Verification pipeline"><span className="pipeline-line" /><PipelineStep number="01" label={<>Agent<br />proposal</>} phase="agent" progress={progress} /><PipelineStep number="02" label={<>Ground<br />truth</>} phase="truth" progress={progress} /><PipelineStep number="03" label={<>Payment<br />gate</>} phase="payment" progress={progress} /></div>
				{error && <div className="error-banner"><strong>Request failed</strong><span>{error}</span></div>}
				{result && <section className="results" aria-live="polite"><div className="results-heading"><div><div className="eyebrow">DECISION TRAIL</div><h2>What happened</h2></div><span className={`decision-chip ${result.verification.allowed ? 'allowed' : 'blocked'}`}>{result.verification.allowed ? 'ALLOW' : 'BLOCK'}</span></div><div className="result-grid"><AgentProposal proposal={result.proposal} /><VerifierResult verification={result.verification} /><PaymentStatus payment={result.payment} /></div></section>}
			</section>
			<footer><span>AGENT CHECKOUT FIREWALL</span><span>CATALOG-BOUND &middot; DETERMINISTIC &middot; AUDITABLE</span></footer>
		</main>
	);
}

export default App;
