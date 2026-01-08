import React from 'react';
import { db } from '../firebase';
import {
    doc,
    updateDoc,
    increment,
    onSnapshot,
    setDoc,
    deleteDoc,
    collection,
    addDoc,
    query,
    orderBy,
    limit
} from 'firebase/firestore';

function Comment({ comment, user }) {
    return (
        <div className="comment-item">
            <div className="comment-avatar">
                {comment.photoURL ? (
                    <img src={comment.photoURL} alt={comment.displayName} />
                ) : (
                    <div className="avatar-placeholder">{comment.displayName?.[0]?.toUpperCase() || 'U'}</div>
                )}
            </div>
            <div className="comment-content">
                <div className="comment-header">
                    <span className="comment-author">{comment.displayName || 'Anonymous'}</span>
                    <span className="comment-date">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Just now'}
                    </span>
                </div>
                <div className="comment-text">{comment.text}</div>
            </div>
        </div>
    );
}

function VideoPlayerInternal({ meta, userId, userSubscribedChannels, onToggleSubscribe }) {
    const [liked, setLiked] = React.useState(false);
    const [likeCount, setLikeCount] = React.useState(meta.likes || 0);
    const videoRef = React.useRef(null);

    // History tracking refs
    const startTimeRef = React.useRef(Date.now());
    const lastUpdateRef = React.useRef(0);
    const lastWatchTimeRef = React.useRef(0);
    const completionTrackedRef = React.useRef(false);

    const isSubbed = meta.channelId && userSubscribedChannels.includes(meta.channelId);

    React.useEffect(() => {
        if (!userId || !meta.id) return;
        const likeRef = doc(db, 'users', userId, 'likedVideos', meta.id);
        const unsub = onSnapshot(likeRef, (snap) => {
            setLiked(snap.exists());
        });
        const videoRefDoc = doc(db, 'videos', meta.id);
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
    }, [userId, meta.id]);

    React.useEffect(() => {
        // Reset tracking on new video
        startTimeRef.current = Date.now();
        lastUpdateRef.current = 0;
        lastWatchTimeRef.current = 0;
        completionTrackedRef.current = false;

        const timer = setTimeout(() => {
            try {
                if (!meta.provider || meta.provider !== 'youtube') {
                    videoRef.current?.play().catch(() => { });
                }
                trackView();
            } catch { }
        }, 100);
        return () => clearTimeout(timer);
    }, [meta.id]);

    async function trackView() {
        try {
            await updateDoc(doc(db, 'videos', meta.id), {
                views: increment(1),
                lastViewedAt: new Date().toISOString()
            });
        } catch (e) {
            console.error('Error tracking view:', e);
        }
    }

    async function handleLike() {
        if (!userId) return alert("Sign in to like.");
        const videoRefDoc = doc(db, 'videos', meta.id);
        const userLikeRef = doc(db, 'users', userId, 'likedVideos', meta.id);

        try {
            if (liked) {
                await deleteDoc(userLikeRef);
                await updateDoc(videoRefDoc, { likes: increment(-1) });
            } else {
                await setDoc(userLikeRef, { likedAt: new Date().toISOString() });
                await updateDoc(videoRefDoc, { likes: increment(1) });
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function onTime() {
        const v = videoRef.current;
        if (!v || !userId || (meta.provider === 'youtube')) return;

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

                await setDoc(doc(db, 'users', userId, 'history', meta.id), {
                    videoId: meta.id,
                    title: meta.title,
                    channelName: meta.channelName || 'Unknown',
                    thumbnail: meta.url,
                    watchedAt: new Date().toISOString(),
                    videoType: meta.type || 'standard',
                    ...updates
                }, { merge: true });

                await updateDoc(doc(db, 'videos', meta.id), {
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
        <div className="watch-player-section">
            <div className="watch-video-wrapper">
                {meta.provider === 'youtube' ? (
                    <iframe
                        src={meta.url}
                        className="watch-iframe"
                        title={meta.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    meta.url ? (
                        <video
                            ref={videoRef}
                            src={meta.url}
                            className="watch-video-element"
                            controls
                            playsInline
                            onTimeUpdate={onTime}
                            autoPlay
                        />
                    ) : (
                        <div className="empty">Video Unavailable</div>
                    )
                )}
            </div>

            <div className="watch-meta">
                <h1 className="watch-title">{meta.title}</h1>
                <div className="watch-actions-row">
                    <div className="watch-channel-info">
                        <div className="channel-avatar-placeholder">
                            {meta.channelName?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div className="channel-details">
                            <span className="channel-name">{meta.channelName || 'Unknown Channel'}</span>
                            <span className="channel-subs">1.2M subscribers</span>
                        </div>
                        {meta.channelId && (
                            <button
                                className={`btn ${isSubbed ? 'btn-secondary' : 'btn-primary'} btn-subscribe`}
                                onClick={() => onToggleSubscribe(meta.channelId)}
                            >
                                {isSubbed ? 'Subscribed' : 'Subscribe'}
                            </button>
                        )}
                    </div>

                    <div className="watch-actions">
                        <button className={`btn-pill ${liked ? 'active' : ''}`} onClick={handleLike}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            <span>{likeCount}</span>
                            <div className="separator" />
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'rotate(180deg)' }}>
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                        </button>

                        <button className="btn-pill">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                <polyline points="16 6 12 2 8 6" />
                                <line x1="12" y1="2" x2="12" y2="15" />
                            </svg>
                            <span>Share</span>
                        </button>
                    </div>
                </div>

                <div className="watch-description">
                    <div className="watch-stats">
                        {meta.views || 0} views  •  {new Date(meta.createdAt).toLocaleDateString()}
                    </div>
                    <p>
                        {meta.description || `Enjoy this amazing video by ${meta.channelName || 'the creator'}. Don't forget to like and subscribe!`}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function Watch({ video, videos, onPlay, user, onToggleSubscribe, subscribedChannels }) {
    const [comments, setComments] = React.useState([]);
    const [newComment, setNewComment] = React.useState('');

    // Scroll to top when video changes
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [video.id]);

    React.useEffect(() => {
        if (!video?.id) return;
        const q = query(
            collection(db, 'videos', video.id, 'comments'),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
        const unsub = onSnapshot(q, (snap) => {
            setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [video.id]);

    async function handleSendComment() {
        if (!user) return alert("Please sign in to comment");
        if (!newComment.trim()) return;

        try {
            await addDoc(collection(db, 'videos', video.id, 'comments'), {
                text: newComment,
                userId: user.uid,
                displayName: user.displayName || 'User',
                photoURL: user.photoURL || null,
                createdAt: new Date().toISOString(),
                likes: 0
            });
            setNewComment('');
        } catch (e) {
            console.error("Error adding comment: ", e);
        }
    }

    const relatedVideos = videos.filter(v => v.id !== video.id).slice(0, 10);

    return (
        <div className="watch-page">
            <div className="watch-content">
                <VideoPlayerInternal
                    meta={video}
                    userId={user?.uid}
                    userSubscribedChannels={subscribedChannels}
                    onToggleSubscribe={onToggleSubscribe}
                />

                <div className="comments-section">
                    <h3>{comments.length} Comments</h3>

                    <div className="add-comment">
                        <div className="avatar-placeholder sm">
                            {user?.displayName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="comment-input-wrapper">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                            />
                            {newComment.trim() && (
                                <div className="comment-actions">
                                    <button className="btn btn-ghost" onClick={() => setNewComment('')}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleSendComment}>Comment</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="comments-list">
                        {comments.map(c => (
                            <Comment key={c.id} comment={c} user={user} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="watch-sidebar">
                {relatedVideos.map(v => (
                    <div key={v.id} className="related-card" onClick={() => onPlay(v)}>
                        <div className="related-thumb">
                            {v.provider === 'youtube' ? (
                                <img
                                    src={`https://img.youtube.com/vi/${v.videoId || v.url.split('embed/')[1]}/mqdefault.jpg`}
                                    alt={v.title}
                                />
                            ) : (
                                <video src={v.url} />
                            )}
                            <span className="duration-badge"></span>
                        </div>
                        <div className="related-info">
                            <h4 className="related-title">{v.title}</h4>
                            <div className="related-meta">{v.channelName}</div>
                            <div className="related-meta">{v.views || 0} views • 2 days ago</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
