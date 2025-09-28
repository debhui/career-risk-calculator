'use client';

import { useState } from 'react';

export default function ResumeUI() {
  const [resumeText, setResumeText] = useState('');
  const [output, setOutput] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('/api/parse-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText }),
    });
    const data = await res.json();
    setOutput(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Resume Parser</h1>
      <textarea
        rows={10}
        cols={50}
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
      />
      <br />
      <button onClick={handleSubmit}>Parse Resume</button>
      <pre>{output}</pre>
    </div>
  );
}
