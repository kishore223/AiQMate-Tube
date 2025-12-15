import React from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';

function ReelItem({ video, isActive, onToggleSubscribe, subscriptions, user }) {
  const videoRef = React.useRef(null);
  const [muted, setMuted] = React.useState(true); // Default muted for browser autoplay policies
  const [liked, setLiked] = React.useState(false);

  // Check if subscribed
  const isSubbed = subscriptions.includes(video.channelName);
  
  // Check if liked (simple local state for UI feel)
  const [likeCount, setLikeCount] = React.useState(Math.floor(Math.random() * 500));

  // Handle Autoplay/Pause based on scroll position
  React.useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isActive) {
      vid.currentTime = 0; // Restart video when entering
      vid.play().catch(err => console.log("Autoplay prevented:", err));
    } else {
      vid.pause();
    }
  }, [isActive]);

  function toggleMute(e) {
    e.stopPropagation();
    setMuted(!muted);
  }

  function handleLike(e) {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  }

  return (
    <div className="reel-item" style={styles.itemContainer}>
      {/* Video Layer */}
      <video
        ref={videoRef}
        src={video.url}
        style={styles.video}
        loop
        playsInline
        muted={muted}
        onClick={toggleMute} // Tap to mute/unmute
      />

      {/* Overlay Layer */}
      <div style={styles.overlay}>
        
        {/* Right Side Actions (Like, Mute, Share) */}
        <div style={styles.actionsColumn}>
          
          {/* Avatar / Subscribe */}
          <div style={styles.actionBtnContainer}>
            <div style={styles.avatar}>
              {video.channelName[0].toUpperCase()}
            </div>
            {!isSubbed && video.creatorId !== user?.uid && (
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleSubscribe(video.channelName); }}
                style={styles.subscribeBadge}
              >
                +
              </button>
            )}
          </div>

          {/* Like Button */}
          <div style={styles.actionBtnContainer} onClick={handleLike}>
            <div style={{ ...styles.iconBase, color: liked ? '#ff2d55' : '#fff' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <span style={styles.actionText}>{likeCount}</span>
          </div>

          {/* Mute Button */}
          <div style={styles.actionBtnContainer} onClick={toggleMute}>
            <div style={styles.iconBase}>
              {muted ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              )}
            </div>
            <span style={styles.actionText}>{muted ? 'Muted' : 'Sound On'}</span>
          </div>

        </div>

        {/* Bottom Info Area */}
        <div style={styles.infoArea}>
          <div style={styles.channelName}>@{video.channelName.replace(/\s+/g, '')}</div>
          <div style={styles.videoTitle}>{video.title}</div>
          <div style={styles.musicRow}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            <span style={{ marginLeft: 6 }}>Original Audio • {video.channelName}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Reels({ videos, subscriptions, onToggleSubscribe, user }) {
  // Only show 'reel' type videos
  const reels = React.useMemo(() => videos.filter(v => v.type === 'reel'), [videos]);
  
  // Track which reel is currently visible
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  // Refs for Intersection Observer
  const containerRef = React.useRef(null);
  const itemRefs = React.useRef([]);

  React.useEffect(() => {
    const observerOptions = {
      root: containerRef.current,
      threshold: 0.6 // Trigger when 60% of the video is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.dataset.index);
          setActiveIndex(index);
        }
      });
    }, observerOptions);

    // Observe all items
    itemRefs.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [reels]);

  if (reels.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg></div>
        <div className="empty-title">No Reels Yet</div>
        <div className="empty-text">Upload a vertical video and select "Reel" to see it here.</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      style={styles.container} 
      className="reels-snap-container"
    >
      {reels.map((reel, index) => (
        <div 
          key={reel.id} 
          data-index={index}
          ref={el => itemRefs.current[index] = el}
          style={{ width: '100%', height: '100%' }} // Container for the item
        >
          <ReelItem
            video={reel}
            isActive={index === activeIndex}
            subscriptions={subscriptions}
            onToggleSubscribe={onToggleSubscribe}
            user={user}
          />
        </div>
      ))}
    </div>
  );
}

// Inline Styles for exact Layout control
const styles = {
  container: {
    height: 'calc(100vh - 120px)', // Adjust based on your Header height
    width: '100%',
    overflowY: 'scroll',
    scrollSnapType: 'y mandatory',
    backgroundColor: '#000',
    position: 'relative',
    scrollbarWidth: 'none', // Firefox hide scrollbar
    msOverflowStyle: 'none', // IE hide scrollbar
  },
  itemContainer: {
    height: '100%', // Full height of the snap container
    width: '100%',
    position: 'relative',
    scrollSnapAlign: 'start',
    display: 'flex',
    justifyContent: 'center',
    background: '#121212'
  },
  video: {
    height: '100%',
    width: '100%',
    objectFit: 'cover', // Ensures it fills the screen like TikTok
    maxWidth: '500px', // Optional: keeps it looking like a phone on desktop
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    pointerEvents: 'none', // Let clicks pass through to video for play/pause/mute
  },
  actionsColumn: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    alignItems: 'center',
    pointerEvents: 'auto', // Re-enable clicks for buttons
    zIndex: 10
  },
  actionBtnContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer'
  },
  iconBase: {
    width: 40,
    height: 40,
    display: 'grid',
    placeItems: 'center',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    marginTop: 4,
    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: '#fff',
    color: '#000',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 800,
    fontSize: 20,
    border: '2px solid #fff',
    marginBottom: 10
  },
  subscribeBadge: {
    position: 'absolute',
    bottom: 5,
    width: 20,
    height: 20,
    background: '#ff2d55',
    color: '#fff',
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    border: 'none',
    cursor: 'pointer'
  },
  infoArea: {
    padding: '20px',
    paddingBottom: '40px', // Space for bottom
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
    color: '#fff',
    textAlign: 'left',
    width: '100%',
    pointerEvents: 'auto'
  },
  channelName: {
    fontWeight: 700,
    fontSize: 16,
    marginBottom: 8,
    cursor: 'pointer'
  },
  videoTitle: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 1.4
  },
  musicRow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    opacity: 0.9
  }
};