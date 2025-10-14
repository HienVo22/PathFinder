import React, { useEffect, useState } from 'react';

export default function ResumeSkills({ parsedText = '' }) {
	const [skills, setSkills] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | failed | no-token

	useEffect(() => {
		let mounted = true;
		async function fetchSkills() {
			setError(null);
			setSkills(null);
			if (!parsedText || parsedText.trim().length === 0) return;
			setLoading(true);
			try {
				const res = await fetch('/api/ai/skills', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ text: parsedText })
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data?.error || 'AI request failed');
				// Build explicit skillsList array from the AI response
				const skillsList = Array.isArray(data.skills) ? data.skills.map(s => String(s).trim()).filter(Boolean) : [];
				if (mounted) setSkills(skillsList);

				// Persist to server if token available; provide status for debugging
				try {
					const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
					if (!token) {
						setSaveStatus('no-token');
					} else if (skillsList.length > 0) {
						setSaveStatus('saving');
						const saveRes = await fetch('/api/user/skills', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${token}`
							},
							body: JSON.stringify({ skills: skillsList })
						});

						const saved = await saveRes.json().catch(() => null);
						if (saveRes.ok) {
							if (mounted) setSkills(Array.isArray(saved?.skills) ? saved.skills : skillsList);
							setSaveStatus('saved');
						} else {
							console.error('Save skills failed', saveRes.status, saved);
							setError(saved?.error || `Save failed (${saveRes.status})`);
							setSaveStatus('failed');
						}
					}
				} catch (e) {
					console.error('Failed to persist skills', e);
					setError(String(e));
					setSaveStatus('failed');
				}
			} catch (err) {
				console.error('Skill fetch error', err);
				if (mounted) setError(String(err));
			} finally {
				if (mounted) setLoading(false);
			}
		}

		fetchSkills();
		return () => { mounted = false; };
	}, [parsedText]);

	if (loading) return <div className="text-sm text-gray-600">Detecting skills…</div>;
	if (error) return <div className="text-sm text-red-600">Error: {error}</div>;
	if (!skills) return null;
	if (Array.isArray(skills) && skills.length === 0) return <div className="text-sm text-gray-500">No skills detected</div>;

	return (
		<div>
			<div className="resume-skills flex flex-wrap gap-2 mb-2">
				{skills.map((s) => (
					<span key={s} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
						{s}
					</span>
				))}
			</div>
			<div className="text-xs text-gray-500">
				{saveStatus === 'saving' && <span>Saving skills…</span>}
				{saveStatus === 'saved' && <span className="text-green-600">Skills saved to your profile.</span>}
				{saveStatus === 'failed' && <span className="text-red-600">Failed to save skills (check console/network).</span>}
				{saveStatus === 'no-token' && <span className="text-yellow-600">Not logged in — skills detected locally but not saved.</span>}
			</div>
		</div>
	);
}
