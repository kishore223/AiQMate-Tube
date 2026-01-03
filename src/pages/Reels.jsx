import React from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, increment, addDoc, collection, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

function ReelItem({ video, isActive, onToggleSubscribe, subscriptions, user }) {
  const videoRef = React.useRef(null);
  const [muted, setMuted] = React.useState(true);
  const [liked, setLiked] = React.useState(false);
  const [likeLoading, setLikeLoading] = React.useState(false);
  const [tracked, setTracked] = React.useState(false);
  const startTimeRef = React.useRef(Date.now());
  const viewTrackedRef = React.useRef(false);

  const isSubbed = subscriptions.includes(video.channelName);
  // We can rely on video.likes from props for the count, as we have real-time updates from parent
  // But strictly speaking, the parent passes 'video' from its list, which might be stale if not careful.
  // However, App.jsx has a listener on 'videos', so props should update.
  const likeCount = video.likes || 0;

  // Check if user has liked this video
  React.useEffect(() => {
    if (!user || !video.id) {
      setLiked(false);
      return;
    }

    // Realtime listener for like status
    const likeRef = doc(db, 'users', user.uid, 'likedVideos', video.id);
    const unsub = onSnapshot(likeRef, (snap) => {
      setLiked(snap.exists());
    });

    return () => unsub();
  }, [user, video.id]);

  React.useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isActive) {
      vid.currentTime = 0;
      vid.play().catch(err => console.log("Autoplay prevented:", err));
      startTimeRef.current = Date.now();

      if (!viewTrackedRef.current) {
        trackView();
        viewTrackedRef.current = true;
      }
    } else {
      vid.pause();
      if (tracked && user) {
        trackWatchSession();
      }
    }
  }, [isActive]);

  async function trackView() {
    try {
      await updateDoc(doc(db, 'videos', video.id), {
        views: increment(1),
        lastViewedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('Error tracking view:', e);
    }
  }

  async function trackWatchSession() {
    if (!user) return;

    const vid = videoRef.current;
    if (!vid) return;

    const watchTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const progress = vid.duration ? (vid.currentTime / vid.duration) : 0;

    if (watchTime < 2) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'history'), {
        videoId: video.id,
        title: video.title,
        channelName: video.channelName || 'Unknown',
        thumbnail: video.url,
        watchedAt: new Date().toISOString(),
        progress: Math.min(1, progress),
        watchTime: watchTime,
        videoType: 'reel'
      });

      await updateDoc(doc(db, 'videos', video.id), {
        watchTime: increment(watchTime),
        completions: progress >= 0.9 ? increment(1) : increment(0)
      });
    } catch (e) {
      console.error('Error tracking history:', e);
    }
  }

  React.useEffect(() => {
    return () => {
      if (tracked && user) {
        trackWatchSession();
      }
    };
  }, []);

  function toggleMute(e) {
    e.stopPropagation();
    setMuted(!muted);
  }

  async function handleLike(e) {
    e.stopPropagation();
    if (!user) return alert("Please sign in to like videos.");
    if (likeLoading) return;

    setLikeLoading(true);
    const videoRef = doc(db, 'videos', video.id);
    const userLikeRef = doc(db, 'users', user.uid, 'likedVideos', video.id);

    try {
      if (liked) {
        // Unlike
        await deleteDoc(userLikeRef);
        await updateDoc(videoRef, { likes: increment(-1) });
      } else {
        // Like
        await setDoc(userLikeRef, { likedAt: new Date().toISOString() });
        await updateDoc(videoRef, { likes: increment(1) });
      }
    } catch (e) {
      console.error('Error updating like:', e);
      alert("Failed to update like. Please try again.");
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleShare(e) {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'videos', video.id), {
        shares: increment(1)
      });

      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: `Check out this reel by ${video.channelName}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Share link copied!');
      }
    } catch (e) {
      console.error('Error sharing:', e);
    }
  }

  function handleTimeUpdate() {
    const vid = videoRef.current;
    if (!vid || tracked || !user) return;

    const progress = vid.duration ? (vid.currentTime / vid.duration) : 0;
    if (vid.currentTime >= 3 || progress >= 0.3) {
      setTracked(true);
    }
  }

  return (
    <div className="reel-item" style={styles.itemContainer}>
      <video
        ref={videoRef}
        src={video.url}
        style={styles.video}
        loop
        playsInline
        muted={muted}
        onClick={toggleMute}
        onTimeUpdate={handleTimeUpdate}
      />

      <div style={styles.overlay}>

        <div style={styles.actionsColumn}>

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

          <div style={styles.actionBtnContainer} onClick={handleLike}>
            <div style={{ ...styles.iconBase, color: liked ? '#ff2d55' : '#fff', transform: liked ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <span style={styles.actionText}>{likeCount}</span>
          </div>

          <div style={styles.actionBtnContainer} onClick={handleShare}>
            <div style={styles.iconBase}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>
            <span style={styles.actionText}>Share</span>
          </div>

          <div style={styles.actionBtnContainer} onClick={toggleMute}>
            <div style={styles.iconBase}>
              {muted ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /></svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
              )}
            </div>
            <span style={styles.actionText}>{muted ? 'Muted' : 'Sound On'}</span>
          </div>

        </div>

        <div style={styles.infoArea}>
          <div style={styles.channelName}>@{video.channelName.replace(/\s+/g, '')}</div>
          <div style={styles.videoTitle}>{video.title}</div>
          <div style={styles.statsRow}>
            <span>{video.views || 0} views</span>
            <span>•</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Reels({ videos, subscriptions, onToggleSubscribe, user, userId }) {
  const reels = React.useMemo(() => videos.filter(v => v.type === 'reel'), [videos]);

  const [activeIndex, setActiveIndex] = React.useState(0);

  const containerRef = React.useRef(null);
  const itemRefs = React.useRef([]);

  React.useEffect(() => {
    const observerOptions = {
      root: containerRef.current,
      threshold: 0.6
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.dataset.index);
          setActiveIndex(index);
        }
      });
    }, observerOptions);

    itemRefs.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [reels]);

  if (reels.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /></svg></div>
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
          style={{ width: '100%', height: '100%' }}
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

const styles = {
  container: {
    height: 'calc(100vh - 120px)',
    width: '100%',
    overflowY: 'scroll',
    scrollSnapType: 'y mandatory',
    backgroundColor: '#000',
    position: 'relative',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  itemContainer: {
    height: '100%',
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
    objectFit: 'cover',
    maxWidth: '500px',
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
    pointerEvents: 'none',
  },
  actionsColumn: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    alignItems: 'center',
    pointerEvents: 'auto',
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
    paddingBottom: '40px',
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
    marginBottom: 8,
    lineHeight: 1.4
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    opacity: 0.9
  }
};