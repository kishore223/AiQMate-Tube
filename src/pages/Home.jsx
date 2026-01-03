import React from 'react';


function HeroCarousel({ videos, onPlay, onToggleSubscribe, subscriptions }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const video = videos[currentIndex];
  const isSubbed = subscriptions.includes(video?.channelName);
  const videoRef = React.useRef(null);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  React.useEffect(() => {
    setCurrentIndex(0);
  }, [videos]);

  if (!video) return null;

  return (
    <div className="hero-video">
      <div className="hero-video-container">
        <video
          ref={videoRef}
          src={video.url}
          className="hero-video-bg"
          autoPlay
          muted
          loop
          playsInline
          key={video.url} // Force reload on video change
        />

        <div className="hero-video-overlay">
          <button className="carousel-btn prev" onClick={handlePrev}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          <div className="hero-content">
            <div className="hero-badge">Recently Added</div>
            <h2 className="hero-title">{video.title}</h2>
            <div className="hero-meta">
              <span className="hero-channel">@{video.channelName}</span>
              <span>•</span>
              <span>{video.views || 0} views</span>
              <span>•</span>
              <span>{video.likes || 0} likes</span>
            </div>
            <div className="hero-actions">
              <button className="btn btn-hero-play" onClick={() => onPlay(video)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </button>
              {video.channelName && video.channelName !== 'You' && (
                <button className="btn btn-hero-secondary" onClick={() => onToggleSubscribe(video.channelName)}>
                  {isSubbed ? 'Subscribed' : 'Subscribe'}
                </button>
              )}
            </div>
          </div>

          <button className="carousel-btn next" onClick={handleNext}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>
      <div className="carousel-dots">
        {videos.map((_, idx) => (
          <div
            key={idx}
            className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
}

function VideoCard({ meta, onPlay, onToggleSubscribe, isSubbed }) {
  const videoRef = React.useRef(null);
  const [thumbnailLoaded, setThumbnailLoaded] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (meta.provider === 'youtube') {
      setThumbnailLoaded(true);
      return;
    }

    const handleLoadedData = () => {
      setThumbnailLoaded(true);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.load();

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [meta.url, meta.provider]);

  return (
    <div className="card">
      <div
        className="video-thumb"
        onMouseEnter={() => {
          if (meta.provider !== 'youtube' && videoRef.current && thumbnailLoaded) {
            videoRef.current.play().catch(() => { });
          }
        }}
        onMouseLeave={() => {
          if (meta.provider !== 'youtube' && videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
        }}
      >
        {meta.provider === 'youtube' ? (
          <img
            src={`https://img.youtube.com/vi/${meta.videoId || meta.url.split('embed/')[1]}/hqdefault.jpg`}
            alt={meta.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <video
            ref={videoRef}
            src={meta.url}
            muted
            playsInline
            preload="metadata"
            loop
            style={{
              opacity: thumbnailLoaded ? 1 : 0,
              transition: 'opacity 0.3s'
            }}
          />
        )}

        {!thumbnailLoaded && meta.provider !== 'youtube' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--warm-gray)'
          }}>
            <div className="loading-sm" />
          </div>
        )}
        <div className="video-thumb-overlay" onClick={() => onPlay(meta)}>
          <div className="play-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      </div>

      <div className="video-meta">
        <h3 className="video-title">{meta.title}</h3>
        <div className="video-info">
          <span className="tag tag-channel">{meta.channelName || 'Unknown'}</span>
          <span>•</span>
          <span>{meta.views || 0} views</span>
          <span>•</span>
          <span>{meta.likes || 0} likes</span>
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
  const recentVideos = videos.slice(0, 5); // Take top 5 for carousel
  const allVideos = videos; // Show all below

  if (isLoading) {
    return (
      <div className="empty">
        <div className="loading" />
        <div className="empty-text" style={{ marginTop: '20px' }}>Connecting to Cloud...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="15" rx="2" ry="2" /><polyline points="17 2 12 7 7 2" /></svg>
        </div>
        <div className="empty-title">No videos yet</div>
        <div className="empty-text">Click "Add Video" to upload your first video to Firebase.</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {recentVideos.length > 0 && (
        <HeroCarousel
          videos={recentVideos}
          onPlay={onPlay}
          onToggleSubscribe={onToggleSubscribe}
          subscriptions={subscriptions}
        />
      )}

      <div className="home-section">
        <div className="section-header">
          <h2 className="section-title-home">All Videos</h2>
          <div className="section-line"></div>
        </div>
        <div className="grid">
          {allVideos.map(v => (
            <VideoCard
              key={v.id}
              meta={v}
              onPlay={onPlay}
              onToggleSubscribe={onToggleSubscribe}
              isSubbed={subscriptions.includes(v.channelName)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}