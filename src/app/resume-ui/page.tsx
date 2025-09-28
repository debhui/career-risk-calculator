'use client';

import { useState } from 'react';

export default function ResumeUI() {
  const [resumeText, setResumeText] = useState('');
  const [output, setOutput] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      setOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      setOutput('Error calling API');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 30, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: 20 }}>Resume Parser</h1>

      <textarea
        rows={10}
        cols={60}
        value={resumeText}
        placeholder="Paste resume text here..."
        onChange={(e) => setResumeText(e.target.value)}
        style={{
          display: 'block',
          marginBottom: 15,
          padding: 10,
          fontSize: 14,
          width: '100%',
          maxWidth: 600,
        }}
      />

      <button
        onClick={handleSubmit}
        style={{
          padding: '10px 20px',
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        Parse Resume
      </button>

      {output && (
        <pre
          style={{
            marginTop: 25,
            padding: 15,
            backgroundColor: '#f0f0f0',
            borderRadius: 5,
            overflowX: 'auto',
            maxWidth: 600,
          }}
        >
          {output}
        </pre>
      )}
    </div>
  );
}
