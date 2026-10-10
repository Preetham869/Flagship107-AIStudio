/**
 * AI Investigation Assistant Workspace
 * Evidence-grounded natural language Q&A and narrative investigation assistant.
 * Interrogates structured M1-M8 evidence without hallucinations.
 */
import { useState } from 'react';
import { askAssistant, getExplanation } from '../../services/api';

const AIAssistantWorkspace = ({ jobId, results, onSeek }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Flagship 107 Intelligence Assistant active. I am grounded directly in the structured M1–M8 evidence for this video. You may ask about detected entity trajectories, velocity anomalies, event clusters, or scene context.',
      citations: [
        { source: 'M1-M8 Ground Truth', frames: results?.frames_processed || 90, entities: results?.m2_unique_tracks || 4 },
      ],
      source: 'Deterministic Evidence Engine (M1-M8 Grounded)',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [explanationData, setExplanationData] = useState(null);
  const [explanationLoading, setExplanationLoading] = useState(false);

  const sampleQuestions = [
    'What entities had sudden speed changes?',
    'Summarize Track #1 movement and velocity profile',
    'What occurred at timestamp 3.0s?',
    'List all high severity events and their track IDs',
    'What is the overall scene risk assessment?',
  ];

  const handleSend = async (questionText) => {
    const query = questionText || inputValue;
    if (!query.trim() || loading) return;

    const userMsg = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const resp = await askAssistant(jobId, query);
      const assistantMsg = {
        sender: 'assistant',
        text: resp.answer,
        citations: resp.citations || [],
        source: resp.source || 'Deterministic Evidence Engine',
        confidence: resp.confidence,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Error querying evidence engine. Please check backend connectivity.',
          source: 'System Error',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFullNarrative = async () => {
    setExplanationLoading(true);
    try {
      const data = await getExplanation(jobId);
      setExplanationData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setExplanationLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', minHeight: '600px' }}>
      {/* Left Column: Interactive Q&A Dialogue */}
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}>
        {/* Dialogue Header */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#020617',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', color: '#f8fafc', fontWeight: '600' }}>
              Evidence Interrogation Chat
            </h4>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Strictly restricted to observable facts, coordinates, and measured kinematics
            </div>
          </div>

          <span style={{
            padding: '3px 8px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid #38bdf8',
            color: '#38bdf8',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600',
          }}>
            GROUNDED
          </span>
        </div>

        {/* Message Stream */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                backgroundColor: msg.sender === 'user' ? '#0284c7' : '#1e293b',
                color: msg.sender === 'user' ? '#fff' : '#e2e8f0',
                padding: '14px 16px',
                borderRadius: '8px',
                border: msg.sender === 'user' ? 'none' : '1px solid #334155',
                fontSize: '13px',
                lineHeight: '1.6',
              }}
            >
              <div>{msg.text}</div>

              {/* Citations & Evidence Tags */}
              {msg.citations && msg.citations.length > 0 && (
                <div style={{
                  marginTop: '10px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontSize: '11px',
                  color: '#94a3b8',
                }}>
                  <span style={{ fontWeight: '600', color: '#38bdf8' }}>Supporting Citations:</span>
                  {msg.citations.map((c, cIdx) => (
                    <div key={cIdx} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {c.source && <span style={{ color: '#cbd5e1' }}>[{c.source}]</span>}
                      {c.track_id !== undefined && (
                        <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>Track #{c.track_id}</span>
                      )}
                      {c.timestamp !== undefined && (
                        <button
                          onClick={() => onSeek?.(c.timestamp)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#38bdf8',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '11px',
                          }}
                        >
                          t={c.timestamp}s ↗
                        </button>
                      )}
                      {c.measurement && <span>{c.measurement}</span>}
                    </div>
                  ))}
                </div>
              )}

              {msg.source && (
                <div style={{ marginTop: '6px', fontSize: '10px', color: '#64748b' }}>
                  Source: {msg.source}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: 'flex-start', color: '#38bdf8', fontSize: '13px' }}>
              Synthesizing evidence citations...
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div style={{
          padding: '10px 16px',
          backgroundColor: '#020617',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}>
          {sampleQuestions.map((q, qIdx) => (
            <button
              key={qIdx}
              onClick={() => handleSend(q)}
              disabled={loading}
              style={{
                padding: '4px 10px',
                backgroundColor: '#1e293b',
                color: '#94a3b8',
                border: '1px solid #334155',
                borderRadius: '14px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div style={{ padding: '14px 16px', backgroundColor: '#0f172a', borderTop: '1px solid #1e293b', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Ask a question about observed tracks, speeds, or anomalies..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 14px',
              backgroundColor: '#020617',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputValue.trim()}
            style={{
              padding: '10px 18px',
              backgroundColor: '#38bdf8',
              color: '#0f172a',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '13px',
            }}
          >
            Ask
          </button>
        </div>
      </div>

      {/* Right Column: Full Scene Narrative Dossier */}
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '15px', color: '#f8fafc', fontWeight: '600' }}>
            M9 Executive Scene Narrative
          </h4>
          <button
            onClick={handleGenerateFullNarrative}
            disabled={explanationLoading}
            style={{
              padding: '6px 12px',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #334155',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {explanationLoading ? 'Synthesizing...' : 'Generate Narrative'}
          </button>
        </div>

        {explanationData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', lineHeight: '1.6' }}>
            <div style={{ padding: '12px', backgroundColor: '#020617', borderRadius: '6px', borderLeft: '3px solid #38bdf8' }}>
              <div style={{ fontWeight: '600', color: '#38bdf8', marginBottom: '4px' }}>Overview</div>
              <div style={{ color: '#cbd5e1' }}>{explanationData.overview}</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#020617', borderRadius: '6px', borderLeft: '3px solid #22c55e' }}>
              <div style={{ fontWeight: '600', color: '#22c55e', marginBottom: '4px' }}>Entity Behaviors</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {explanationData.entity_behaviors?.map((eb, idx) => (
                  <div key={idx} style={{ color: '#cbd5e1' }}>
                    <strong style={{ color: '#38bdf8' }}>Track #{eb.track_id}:</strong> {eb.behavior_summary}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#020617', borderRadius: '6px', borderLeft: '3px solid #a855f7' }}>
              <div style={{ fontWeight: '600', color: '#a855f7', marginBottom: '4px' }}>Contextual Interpretation</div>
              <div style={{ color: '#cbd5e1' }}>{explanationData.contextual_interpretation}</div>
            </div>

            <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
              <span>Engine: {explanationData.model_name}</span>
              <span>Coverage: {(explanationData.evidence_coverage * 100).toFixed(0)}%</span>
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            color: '#64748b',
            padding: '30px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
            <div style={{ color: '#94a3b8', fontWeight: '500' }}>No Executive Narrative Generated Yet</div>
            <div style={{ fontSize: '12px', marginTop: '6px' }}>
              Click "Generate Narrative" above to produce a structured natural language synthesis from M1-M8 evidence.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistantWorkspace;
