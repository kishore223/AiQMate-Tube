import React from 'react';
import { db } from '../firebase';
import { doc, updateDoc, increment, addDoc, collection, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const Icons = {
  Heart: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  HeartOutline: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  Play: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>,
  Pause: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>,
  Volume: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>,
  VolumeX: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>,
};

function ReelCard({ video, isActive, userId, onToggleSubscribe, isSubscribed }) {
  const videoRef = React.useRef(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(video.likes || 0);
  const [tracked, setTracked] = React.useState(false);
  const startTimeRef = React.useRef(Date.now());

  // Listen to like status
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

  // Auto-play when active
  React.useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isActive) {
      vid.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log('Autoplay prevented:', err);
        setIsPlaying(false);
      });

      // Track view after 1 second
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
    if (!v || tracked || !userId) return;
    const progress = v.duration ? (v.currentTime / v.duration) : 0;
    if (v.currentTime >= 5 || progress >= 0.5) {
      try {
        const watchTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
        await addDoc(collection(db, 'users', userId, 'history'), {
          videoId: video.id,
          title: video.title,
          channelName: video.channelName || 'Unknown',
          thumbnail: video.thumbnail || video.url,
          watchedAt: new Date().toISOString(),
          progress: Math.min(1, progress),
          watchTime: watchTime,
          videoType: video.type || 'reel'
        });

        await updateDoc(doc(db, 'videos', video.id), {
          watchTime: increment(watchTime),
          completions: progress >= 0.9 ? increment(1) : increment(0)
        });
      } catch (e) {
        console.error('Error tracking history:', e);
      }
      setTracked(true);
    }
  }

  return (
    <div className="reel-card">
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

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="reel-play-overlay" onClick={togglePlayPause}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer'
          }}>
            <Icons.Play />
          </div>
        </div>
      )}

      {/* Video Info Overlay */}
      <div className="reel-info">
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {video.title}
          </h3>
          <div style={{ fontSize: 14, marginBottom: 4, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            <strong>@{video.channelName || 'Unknown'}</strong>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {video.views || 0} views • {likeCount} likes
          </div>
          {video.description && (
            <p style={{ fontSize: 13, marginTop: 8, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)', maxWidth: '90%' }}>
              {video.description.slice(0, 100)}{video.description.length > 100 ? '...' : ''}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="reel-actions">
          <button
            className="reel-action-btn"
            onClick={handleLike}
            style={{ color: liked ? '#ff4757' : '#fff' }}
          >
            {liked ? <Icons.Heart /> : <Icons.HeartOutline />}
            <span style={{ fontSize: 12, marginTop: 4 }}>{likeCount}</span>
          </button>

          {video.channelId && (
            <button
              className="reel-action-btn"
              onClick={() => onToggleSubscribe(video.channelId)}
              style={{
                background: isSubscribed ? 'rgba(255,255,255,0.2)' : 'var(--accent-gold)',
                color: isSubscribed ? '#fff' : '#000',
                fontSize: 11,
                padding: '4px'
              }}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}

          <button
            className="reel-action-btn"
            onClick={toggleMute}
          >
            {isMuted ? <Icons.VolumeX /> : <Icons.Volume />}
          </button>
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

  // Filter ONLY for reel type videos that are published
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
      }, 500);
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
      }, 500);
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

  // Keyboard navigation
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
      <div className="reels-container" style={{ display: 'grid', placeItems: 'center' }}>
        <div>
          <div className="loading" />
          <div style={{ marginTop: 20, color: '#fff', textAlign: 'center' }}>Loading reels...</div>
        </div>
      </div>
    );
  }

  if (reelVideos.length === 0) {
    return (
      <div className="reels-container" style={{ display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📱</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>No Reels Yet</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>
            Upload your first video and mark it as a "Reel" to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="reels-container" ref={containerRef}>
      {reelVideos.map((video, index) => (
        <div
          key={video.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: `translateY(${(index - currentIndex) * 100}%)`,
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: index === currentIndex ? 1 : 0.3,
            pointerEvents: index === currentIndex ? 'auto' : 'none'
          }}
        >
          <ReelCard
            video={video}
            isActive={index === currentIndex}
            userId={userId}
            onToggleSubscribe={onToggleSubscribe}
            isSubscribed={video.channelId && subscribedChannels.includes(video.channelId)}
          />
        </div>
      ))}

      {/* Navigation Indicators */}
      <div className="reels-nav-dots">
        {reelVideos.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`reels-nav-dot ${index === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="reels-counter">
        {currentIndex + 1} / {reelVideos.length}
      </div>

      {/* Scroll Hint */}
      {currentIndex === 0 && reelVideos.length > 1 && (
        <div className="reels-scroll-hint">
          ↓ Scroll or swipe for more
        </div>
      )}
    </div>
  );
}