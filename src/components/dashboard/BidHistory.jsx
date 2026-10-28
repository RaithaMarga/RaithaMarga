const LABELS = {
  BUYER: ['Buyer offered', 'ಖರೀದಿದಾರರ ಪ್ರಸ್ತಾವನೆ'],
  FARMER: ['Farmer countered', 'ರೈತರ ಪ್ರತಿಪ್ರಸ್ತಾವನೆ'],
  FARMER_ACCEPTED: ['Farmer accepted', 'ರೈತರು ಒಪ್ಪಿದರು'],
  FARMER_REJECTED: ['Farmer rejected', 'ರೈತರು ತಿರಸ್ಕರಿಸಿದರು'],
  BUYER_ACCEPTED: ['Buyer accepted', 'ಖರೀದಿದಾರರು ಒಪ್ಪಿದರು'],
  BUYER_REJECTED: ['Buyer rejected', 'ಖರೀದಿದಾರರು ತಿರಸ್ಕರಿಸಿದರು'],
};

/** Round-by-round price trail for one negotiation. Old bids without history render nothing. */
export default function BidHistory({ bid, isKannada = false }) {
  const history = Array.isArray(bid?.history) ? bid.history : [];
  if (history.length < 2) return null;
  return (
    <ol style={{ margin: 'var(--space-3) 0 0', paddingLeft: '1.2rem', color: 'var(--color-ink-soft)', fontSize: 'var(--font-size-sm)' }}>
      {history.map((entry, index) => {
        const label = LABELS[entry.by] || [entry.by, entry.by];
        return (
          <li key={`${entry.at}-${index}`}>
            {label[isKannada ? 1 : 0]}{entry.price != null ? <> · <strong>₹{entry.price}</strong> / {bid.unit || 'kg'}</> : null}
          </li>
        );
      })}
    </ol>
  );
}
