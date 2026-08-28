import { useState } from 'react';
import { useFarmerData } from '../../context/FarmerDataContext';
import StatusBadge from '../../components/dashboard/StatusBadge';
import '../../components/dashboard/dashboard-ui.css';

const REQUIRED_DOCS = [
  { id: 'id_proof', label: 'Government ID (Aadhaar / Voter ID)' },
  { id: 'land_record', label: 'Land Record (RTC / 7-12 extract)' },
  { id: 'bank_proof', label: 'Bank Passbook / Cancelled Cheque' },
];

const Verification = () => {
  const { verification, submitForVerification } = useFarmerData();
  const [files, setFiles] = useState({});
  const [message, setMessage] = useState('');

  const handleFile = (docId, label) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFiles((prev) => ({ ...prev, [docId]: { label, fileName: file.name } }));
  };

  const allUploaded = REQUIRED_DOCS.every((d) => files[d.id]);

  const handleSubmit = () => {
    const documents = REQUIRED_DOCS.map((d) => ({
      id: d.id,
      label: d.label,
      fileName: files[d.id]?.fileName || null,
      uploadedAt: new Date().toISOString(),
    }));
    submitForVerification(documents);
    setMessage('Submitted for review. Your status will update once RaithaMarga confirms your documents.');
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Verification</h1>
          <p className="dash-page__subtitle">Verified farmers get priority visibility to buyers.</p>
        </div>
        <StatusBadge status={verification.status} />
      </div>

      <div className="dash-panel" style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {verification.status === 'verified' ? (
          <p style={{ color: 'var(--color-primary-dark)', fontWeight: 600 }}>
            You're verified. Buyers can see your verified badge on every listing.
          </p>
        ) : (
          <>
            <p style={{ color: 'var(--color-ink-soft)', fontSize: 'var(--font-size-sm)' }}>
              Upload the documents below. Your status will only change to <strong>Verified</strong> once
              RaithaMarga's team confirms them — this keeps the badge meaningful for buyers.
            </p>

            {REQUIRED_DOCS.map((doc) => {
              const existing = verification.documents?.find((d) => d.id === doc.id);
              const staged = files[doc.id];
              return (
                <div key={doc.id} className="doc-row">
                  <div className="doc-row__label">
                    <span>{doc.label}</span>
                    {staged ? (
                      <span className="doc-row__filename">Selected: {staged.fileName}</span>
                    ) : existing?.fileName ? (
                      <span className="doc-row__filename">Previously submitted: {existing.fileName}</span>
                    ) : (
                      <span className="doc-row__filename">Not uploaded</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFile(doc.id, doc.label)}
                    aria-label={`Upload ${doc.label}`}
                  />
                </div>
              );
            })}

            {message ? (
              <p role="status" style={{ color: 'var(--color-primary-dark)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                {message}
              </p>
            ) : null}

            <div className="dash-form__actions">
              <button
                type="button"
                className="btn btn--primary"
                disabled={!allUploaded}
                onClick={handleSubmit}
              >
                Submit for Verification
              </button>
              {!allUploaded && (
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-ink-faint)', alignSelf: 'center' }}>
                  Upload all three documents to submit.
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Verification;
