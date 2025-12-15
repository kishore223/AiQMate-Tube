import React from 'react';

function VideoCard({ meta, onPlay, onToggleSubscribe, isSubbed }) {
  const videoRef = React.useRef(null);

  return (
    <div className="card">
      <div 
        className="video-thumb" 
        onMouseEnter={() => videoRef.current?.play().catch(()=>{})}
        onMouseLeave={() => {
          if(videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
        }}
      >
        <video
          ref={videoRef}
          src={meta.url}
          muted
          playsInline
          preload="metadata"
          loop
        />
        <div className="video-thumb-overlay" onClick={() => onPlay(meta)}>
          <div className="play-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>

      <div className="video-meta">
        <h3 className="video-title">{meta.title}</h3>
        <div className="video-info">
          <span className="tag tag-channel">{meta.channelName || 'Unknown'}</span>
          <span>•</span>
          <span>{new Date(meta.createdAt).toLocaleDateString()}</span>
          {meta.type === 'reel' && (
            <><span>•</span><span className="tag tag-reel">Reel</span></>
          )}
        </div>
        <div className="video-actions">
          <button className="btn btn-secondary" onClick={() => onPlay(meta)} style={{ flex: 1 }}>Play</button>
          {meta.channelName && meta.channelName !== 'You' && (
            <button className="btn btn-ghost" onClick={() => onToggleSubscribe(meta.channelName)}>
              {isSubbed ? 'Unsub' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home({ videos, onPlay, onToggleSubscribe, subscriptions, isLoading }) {
  
  // 1. Show Loading State
  if (isLoading) {
    return (
      <div className="empty">
        <div className="loading" />
        <div className="empty-text" style={{marginTop: '20px'}}>Connecting to Cloud...</div>
      </div>
    );
  }

  // 2. Show Empty State (only if NOT loading and NO videos)
  if (videos.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
        </div>
        <div className="empty-title">No videos yet</div>
        <div className="empty-text">Click "Add Video" to upload your first video to Firebase.</div>
      </div>
    );
  }

  // 3. Show Videos
  return (
    <div className="grid">
      {videos.map(v => (
        <VideoCard
          key={v.id}
          meta={v}
          onPlay={onPlay}
          onToggleSubscribe={onToggleSubscribe}
          isSubbed={subscriptions.includes(v.channelName)}
        />
      ))}
    </div>
  );
}