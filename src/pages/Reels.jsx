import React from 'react';
import { db } from '../firebase';
import { doc, updateDoc, increment, addDoc, collection, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const Icons = {
  Heart: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  HeartOutline: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  Play: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>,
  Volume: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>,
  VolumeX: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>,
  ChevronDown: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>,
};

function ReelCard({ video, isActive, userId, onToggleSubscribe, isSubscribed }) {
  const videoRef = React.useRef(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(video.likes || 0);
  const [tracked, setTracked] = React.useState(false);
  const startTimeRef = React.useRef(Date.now());
  const lastUpdateRef = React.useRef(0);
  const lastWatchTimeRef = React.useRef(0);
  const completionTrackedRef = React.useRef(false);

  React.useEffect(() => {
    if (!userId || !video.id) return;
    const likeRef = doc(db, 'users', userId, 'likedVideos', video.id);
    const unsub = onSnapshot(likeRef, (snap) => {
      setLiked(snap.exists());
    });
    const videoRefDoc = doc(db, 'videos', video.id);
    const unsubVideo = onSnapshot(videoRefDoc, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setLikeCount(data.likes || 0);
      }
    });
    return () => {
      unsub();
      unsubVideo();
    };
  }, [userId, video.id]);

  React.useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isActive) {
      vid.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });

      const viewTimer = setTimeout(() => {
        trackView();
      }, 1000);

      return () => clearTimeout(viewTimer);
    } else {
      vid.pause();
      vid.currentTime = 0;
      setIsPlaying(false);
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

  async function handleLike() {
    if (!userId) return alert("Sign in to like.");
    const videoRefDoc = doc(db, 'videos', video.id);
    const userLikeRef = doc(db, 'users', userId, 'likedVideos', video.id);

    try {
      if (liked) {
        await deleteDoc(userLikeRef);
        await updateDoc(videoRefDoc, { likes: increment(-1) });
      } else {
        await setDoc(userLikeRef, { likedAt: new Date().toISOString() });
        await updateDoc(videoRefDoc, { likes: increment(1) });
      }
    } catch (e) {
      console.error('Error toggling like:', e);
    }
  }

  function togglePlayPause() {
    const vid = videoRef.current;
    if (!vid) return;

    if (isPlaying) {
      vid.pause();
      setIsPlaying(false);
    } else {
      vid.play();
      setIsPlaying(true);
    }
  }

  function toggleMute() {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  }

  async function onTimeUpdate() {
    const v = videoRef.current;
    if (!v || !userId) return;

    const now = Date.now();
    if (now - lastUpdateRef.current < 5000) return;

    const progress = v.duration ? (v.currentTime / v.duration) : 0;
    const sessionWatchTime = Math.floor((now - startTimeRef.current) / 1000);
    const deltaWatchTime = Math.max(0, sessionWatchTime - lastWatchTimeRef.current);

    if (deltaWatchTime > 0 || progress > 0) {
      try {
        const updates = {
          progress: Math.min(1, progress),
          watchTime: increment(deltaWatchTime)
        };

        if (progress >= 0.9 && !completionTrackedRef.current) {
          updates.completions = increment(1);
          completionTrackedRef.current = true;
        }

        await setDoc(doc(db, 'users', userId, 'history', video.id), {
          videoId: video.id,
          title: video.title,
          channelName: video.channelName || 'Unknown',
          thumbnail: video.thumbnail || video.url,
          watchedAt: new Date().toISOString(),
          videoType: video.type || 'reel',
          ...updates
        }, { merge: true });

        await updateDoc(doc(db, 'videos', video.id), {
          watchTime: increment(deltaWatchTime),
          ...(progress >= 0.9 && updates.completions ? { completions: increment(1) } : {})
        });

        lastWatchTimeRef.current = sessionWatchTime;
        lastUpdateRef.current = now;
      } catch (e) {
        console.error('Error tracking history:', e);
      }
    }
  }

  return (
    <div className="reel-scroll-item">
      <div className="reel-video-wrapper">
        <video
          ref={videoRef}
          src={video.url}
          className="reel-video"
          loop
          playsInline
          muted={isMuted}
          onTimeUpdate={onTimeUpdate}
          onClick={togglePlayPause}
        />

        {!isPlaying && (
          <div className="reel-play-overlay" onClick={togglePlayPause}>
            <div className="reel-play-button">
              <Icons.Play />
            </div>
          </div>
        )}

        <div className="reel-info-overlay">
          <div className="reel-info-content">
            <h3 className="reel-title">{video.title}</h3>
            <div className="reel-meta">
              <span className="tag tag-channel">@{video.channelName || 'Unknown'}</span>
              <span>•</span>
              <span>{video.views || 0} views</span>
              <span>•</span>
              <span>{likeCount} likes</span>
            </div>
            {video.description && (
              <p className="reel-description">
                {video.description.slice(0, 120)}{video.description.length > 120 ? '...' : ''}
              </p>
            )}
          </div>

          <div className="reel-actions">
            <button
              className={`reel-action-btn ${liked ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              title={liked ? 'Unlike' : 'Like'}
            >
              {liked ? <Icons.Heart /> : <Icons.HeartOutline />}
              <span className="reel-action-label">{likeCount}</span>
            </button>

            {video.channelId && (
              <button
                className={`reel-action-btn ${isSubscribed ? 'subscribed' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSubscribe(video.channelId);
                }}
                title={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  {isSubscribed && <polyline points="22 4 12 14.01 9 11.01" />}
                  {!isSubscribed && <line x1="12" y1="8" x2="12" y2="16" />}
                  {!isSubscribed && <line x1="8" y1="12" x2="16" y2="12" />}
                </svg>
                <span className="reel-action-label">{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
              </button>
            )}

            <button
              className="reel-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <Icons.VolumeX /> : <Icons.Volume />}
              <span className="reel-action-label">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Reels({ videos, userId, onToggleSubscribe, subscribedChannels, isLoading }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const containerRef = React.useRef(null);
  const touchStartY = React.useRef(0);
  const isScrolling = React.useRef(false);

  const reelVideos = videos.filter(v => v.published === true && v.type === 'reel');

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleWheel(e) {
      if (isScrolling.current) return;

      e.preventDefault();
      isScrolling.current = true;

      if (e.deltaY > 0 && currentIndex < reelVideos.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }

      setTimeout(() => {
        isScrolling.current = false;
      }, 600);
    }

    function handleTouchStart(e) {
      touchStartY.current = e.touches[0].clientY;
    }

    function handleTouchEnd(e) {
      if (isScrolling.current) return;

      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY.current - touchEndY;

      if (Math.abs(diff) < 50) return;

      isScrolling.current = true;

      if (diff > 0 && currentIndex < reelVideos.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }

      setTimeout(() => {
        isScrolling.current = false;
      }, 600);
    }

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, reelVideos.length]);

  React.useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'ArrowDown' && currentIndex < reelVideos.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, reelVideos.length]);

  if (isLoading) {
    return (
      <div className="empty">
        <div className="loading" />
        <div className="empty-text" style={{ marginTop: 20 }}>Loading reels...</div>
      </div>
    );
  }

  if (reelVideos.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
          </svg>
        </div>
        <div className="empty-title">No Reels Yet</div>
        <div className="empty-text">
          Upload your first vertical video and mark it as a "Reel" to see it here
        </div>
      </div>
    );
  }

  return (
    <div className="reels-scroll-container" ref={containerRef}>
      <div className="reels-counter-badge">
        {currentIndex + 1} / {reelVideos.length}
      </div>

      {currentIndex === 0 && reelVideos.length > 1 && (
        <div className="reels-scroll-hint">
          <Icons.ChevronDown />
          <span>Scroll for more</span>
        </div>
      )}

      <div className="reels-scroll-wrapper" style={{ transform: `translateY(-${currentIndex * 100}%)` }}>
        {reelVideos.map((video, index) => (
          <ReelCard
            key={video.id}
            video={video}
            isActive={index === currentIndex}
            userId={userId}
            onToggleSubscribe={onToggleSubscribe}
            isSubscribed={video.channelId && subscribedChannels.includes(video.channelId)}
          />
        ))}
      </div>

      {reelVideos.length > 1 && (
        <div className="reels-progress-dots">
          {reelVideos.map((_, index) => (
            <div
              key={index}
              className={`reel-progress-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}