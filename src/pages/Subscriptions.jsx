import React from 'react';

function ChannelSection({ channel, videos, onPlay, onToggleSubscribe }) {
  const channelVideos = videos.filter(v => v.channelName === channel);
  const [expanded, setExpanded] = React.useState(true);
  
  return (
    <div style={{ marginBottom: 32 }}>
      <div 
        style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, cursor: 'pointer', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#d4a574', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 20, color: '#000' }}>
            {channel[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{channel}</div>
            <div className="small">{channelVideos.length} video{channelVideos.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); onToggleSubscribe(channel); }}>Unsubscribe</button>
        </div>
      </div>

      {expanded && (
        <div className="grid">
          {channelVideos.map(video => (
            <div key={video.id} className="card">
               <div className="video-thumb" onClick={() => onPlay(video)}>
                 <video src={video.url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               </div>
               <div className="video-meta">
                 <div className="video-title">{video.title}</div>
                 <button className="btn btn-secondary" onClick={() => onPlay(video)}>Play</button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Subscriptions({ videos, onPlay, onToggleSubscribe, subscriptions, isLoading }) {
  const subscribedVideos = videos.filter(v => subscriptions.includes(v.channelName));

  if (isLoading) return <div className="empty"><div className="loading" /></div>;

  if (subscriptions.length === 0) {
    return (
      <div className="empty">
        <div className="empty-title">No subscriptions</div>
        <div className="empty-text">Subscribe to channels to see them here.</div>
      </div>
    );
  }

  if (subscribedVideos.length === 0) {
    return (
      <div className="empty">
        <div className="empty-title">No new videos</div>
        <div className="empty-text">Your subscribed channels haven't posted yet.</div>
      </div>
    );
  }

  return (
    <div>
      {subscriptions.map(channel => (
        <ChannelSection
          key={channel}
          channel={channel}
          videos={subscribedVideos}
          onPlay={onPlay}
          onToggleSubscribe={onToggleSubscribe}
        />
      ))}
    </div>
  );
}