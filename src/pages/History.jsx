import React from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

function HistoryItem({ entry, onReplay }) {
  const watchedDate = new Date(entry.watchedAt);
  const timeStr = watchedDate.toLocaleDateString() + ' ' + watchedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  return (
    <div className="history-item" onClick={() => onReplay(entry.videoId)}>
      <div className="history-thumb">
        <div className="play-icon" style={{ width: 40, height: 40 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <div className="history-info">
        <div className="history-title">{entry.title}</div>
        <div className="history-meta">
          <span className="tag tag-channel">{entry.channelName}</span>
          <span>•</span>
          <span>Watched {timeStr}</span>
        </div>
      </div>
    </div>
  );
}

export default function History({ onReplay }) {
  const [history, setHistory] = React.useState([]);

  React.useEffect(() => {
    const q = query(collection(db, 'users', 'guest-user', 'history'), orderBy('watchedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  if (history.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
        <div className="empty-title">No watch history</div>
        <div className="empty-text">Videos you watch will appear here.</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title" style={{ fontSize: 20, marginBottom: 16 }}>Watch History</h2>
      <div className="history-list">
        {history.map(entry => (
          <HistoryItem key={entry.id} entry={entry} onReplay={onReplay} />
        ))}
      </div>
    </div>
  );
}