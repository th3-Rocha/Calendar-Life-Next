import React, { useState, useEffect } from 'react';
import { Download, Upload, X, Save, Copy } from 'lucide-react';

interface JSONModalProps {
  isOpen: boolean;
  onClose: () => void;
  jsonData: string;
  onImport: (jsonString: string) => boolean;
}

export default function JSONModal({ isOpen, onClose, jsonData, onImport }: JSONModalProps) {
  const [localData, setLocalData] = useState(jsonData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalData(jsonData);
      setError(null);
    }
  }, [isOpen, jsonData]);

  if (!isOpen) return null;

  const handleSave = () => {
    const success = onImport(localData);
    if (success) {
      onClose();
    } else {
      setError('Invalid JSON format or missing required fields (birthDate, statuses).');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([localData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'life-calendar-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(localData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setLocalData(content);
    };
    reader.readAsText(file);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Data Manager (JSON)</h2>
          <button onClick={onClose} style={styles.iconButton} title="Close">
            <X size={20} />
          </button>
        </div>

        <div style={styles.body}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
            Edit your Life Calendar data directly, or import/export the JSON file.
          </p>

          <textarea
            style={styles.textarea}
            value={localData}
            onChange={(e) => setLocalData(e.target.value)}
            spellCheck={false}
          />

          {error && <div style={styles.error}>{error}</div>}
        </div>

        <div style={styles.footer}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <label style={styles.buttonSecondary} title="Upload JSON">
              <Upload size={16} /> Upload
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
            </label>
            <button onClick={handleDownload} style={styles.buttonSecondary} title="Download JSON">
              <Download size={16} /> Download
            </button>
            <button onClick={handleCopy} style={styles.buttonSecondary} title="Copy to clipboard">
              <Copy size={16} /> Copy
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} style={styles.buttonSecondary}>
              Cancel
            </button>
            <button onClick={handleSave} style={styles.buttonPrimary}>
              <Save size={16} /> Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '800px',
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    color: '#333',
    fontFamily: 'sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #eee',
  },
  body: {
    padding: '20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  textarea: {
    flex: 1,
    width: '100%',
    fontFamily: 'monospace',
    fontSize: '14px',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    resize: 'none',
    boxSizing: 'border-box',
    outline: 'none',
  },
  error: {
    marginTop: '10px',
    color: '#d32f2f',
    fontSize: '14px',
    backgroundColor: '#ffebee',
    padding: '10px',
    borderRadius: '4px',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  buttonSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
  },
};
