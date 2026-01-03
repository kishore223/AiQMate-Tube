import React from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

function HistoryItem({ entry, onReplay, videos, onDelete }) {
  const watchedDate = new Date(entry.watchedAt);
  const timeStr = watchedDate.toLocaleDateString() + ' ' + watchedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const video = videos.find(v => v.id === entry.videoId);
  const progressPercent = Math.round((entry.progress || 0) * 100);
  const watchTimeFormatted = entry.watchTime ? `${Math.floor(entry.watchTime / 60)}:${String(entry.watchTime % 60).padStart(2, '0')}` : '0:00';

  return (
    <div className="history-item">
      <div className="history-thumb" onClick={() => video && onReplay(video)}>
        {video ? (
          <>
            <video src={video.url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div className="video-thumb-overlay">
              <div className="play-icon" style={{ width: 40, height: 40 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>
            {entry.videoType === 'reel' && (
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'var(--accent-navy)',
                color: '#fff',
                padding: '3px 8px',
                borderRadius: 12,
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                REEL
              </div>
            )}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'rgba(255,255,255,0.2)'
            }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'var(--accent-gold)',
                transition: 'width 0.3s'
              }} />
            </div>
          </>
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'var(--warm-gray)',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--text-muted)',
            fontSize: 12
          }}>
            Video Deleted
          </div>
        )}
      </div>
      <div className="history-info">
        <div className="history-title">{entry.title}</div>
        <div className="history-meta">
          <span className="tag tag-channel">{entry.channelName}</span>
          <span>•</span>
          <span>{timeStr}</span>
        </div>
        <div style={{
          display: 'flex',
          gap: 16,
          marginTop: 8,
          fontSize: 11,
          color: 'var(--text-secondary)',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          <span>Progress: {progressPercent}%</span>
          <span>•</span>
          <span>Watch Time: {watchTimeFormatted}</span>
        </div>
      </div>
      <button
        className="btn btn-ghost"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(entry.id);
        }}
        style={{
          padding: '8px 12px',
          marginLeft: 'auto'
        }}
      >
        Remove
      </button>
    </div>
  );
}

export default function History({ userId, videos, onReplay }) {
  const [history, setHistory] = React.useState([]);
  const [filter, setFilter] = React.useState('all');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'users', userId, 'history'),
      orderBy('watchedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error('Error loading history:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  async function handleDelete(historyId) {
    if (!confirm('Remove this video from your history?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId, 'history', historyId));
    } catch (e) {
      alert('Error removing from history: ' + e.message);
    }
  }

  async function handleClearAll() {
    if (!confirm('Clear all watch history? This cannot be undone.')) return;
    try {
      const promises = history.map(h => deleteDoc(doc(db, 'users', userId, 'history', h.id)));
      await Promise.all(promises);
    } catch (e) {
      alert('Error clearing history: ' + e.message);
    }
  }

  const filteredHistory = React.useMemo(() => {
    if (filter === 'reels') return history.filter(h => h.videoType === 'reel');
    if (filter === 'standard') return history.filter(h => h.videoType !== 'reel');
    if (filter === 'completed') return history.filter(h => (h.progress || 0) >= 0.9);
    return history;
  }, [history, filter]);

  const stats = React.useMemo(() => {
    const totalWatchTime = history.reduce((sum, h) => sum + (h.watchTime || 0), 0);
    const totalVideos = history.length;
    const reelsCount = history.filter(h => h.videoType === 'reel').length;
    const completedCount = history.filter(h => (h.progress || 0) >= 0.9).length;

    return {
      totalVideos,
      reelsCount,
      standardCount: totalVideos - reelsCount,
      completedCount,
      totalWatchTime,
      avgWatchTime: totalVideos > 0 ? Math.floor(totalWatchTime / totalVideos) : 0
    };
  }, [history]);

  if (loading) {
    return (
      <div className="empty">
        <div className="loading" />
        <div className="empty-text" style={{ marginTop: 20 }}>Loading watch history...</div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
        <div className="empty-title">No watch history</div>
        <div className="empty-text">Videos you watch will appear here.</div>
      </div>
    );
  }

  const formatWatchTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="section-title" style={{ fontSize: 20, margin: 0 }}>Watch History</h2>
          {history.length > 0 && (
            <button className="btn btn-danger" onClick={handleClearAll} style={{ padding: '8px 16px', fontSize: 12 }}>
              Clear All History
            </button>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24
        }}>
          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-gold)', marginBottom: 4 }}>
              {stats.totalVideos}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Videos
            </div>
          </div>

          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-sage)', marginBottom: 4 }}>
              {formatWatchTime(stats.totalWatchTime)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Watch Time
            </div>
          </div>

          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-navy)', marginBottom: 4 }}>
              {stats.reelsCount}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Reels
            </div>
          </div>

          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-rose)', marginBottom: 4 }}>
              {stats.completedCount}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Completed
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter('all')}
            style={{ padding: '8px 16px', fontSize: 12 }}
          >
            All ({history.length})
          </button>
          <button
            className={`btn ${filter === 'standard' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter('standard')}
            style={{ padding: '8px 16px', fontSize: 12 }}
          >
            Videos ({stats.standardCount})
          </button>
          <button
            className={`btn ${filter === 'reels' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter('reels')}
            style={{ padding: '8px 16px', fontSize: 12 }}
          >
            Reels ({stats.reelsCount})
          </button>
          <button
            className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter('completed')}
            style={{ padding: '8px 16px', fontSize: 12 }}
          >
            Completed ({stats.completedCount})
          </button>
        </div>
      </div>

      <div className="history-list">
        {filteredHistory.map(entry => (
          <HistoryItem
            key={entry.id}
            entry={entry}
            videos={videos}
            onReplay={onReplay}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="empty" style={{ padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div className="empty-title">No videos match this filter</div>
          <div className="empty-text">Try selecting a different filter</div>
        </div>
      )}
    </div>
  );
}