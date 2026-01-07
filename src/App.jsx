import React from 'react';
import Home from './pages/Home';
import Reels from './pages/Reels';
import History from './pages/History';
import Channels from './pages/Channels';
import Profile from './pages/Profile';
import Media from './pages/Media';
import Auth from './pages/Auth';
import Admin from './pages/Admin';

// Firebase Imports
import { db, storage, auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  doc,
  setDoc,
  updateDoc,
  increment,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

// Icons
const Icons = {
  Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Reels: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></svg>,
  History: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Channels: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Profile: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Media: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M12 2v20" /><path d="M2 12h20" /></svg>,
  Admin: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Play: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  Camera: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>,
  Logo: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4a574" />
          <stop offset="100%" stopColor="#b88a5a" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="url(#logoGrad)" stroke="#0a0b0e" strokeWidth="1" />
      <path d="M13 10.5 L13 21.5 L22 16 Z" fill="#0a0b0e" stroke="#0a0b0e" strokeWidth="0.5" strokeLinejoin="round" />
      <rect x="6" y="12" width="2" height="8" fill="rgba(10,11,14,0.3)" rx="0.5" />
      <rect x="6" y="13" width="2" height="1.5" fill="#0a0b0e" opacity="0.2" />
      <rect x="6" y="17.5" width="2" height="1.5" fill="#0a0b0e" opacity="0.2" />
      <path d="M 10 6 Q 16 8, 22 6" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  ),
  Logout: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
};

function Sidebar({ active, onSelect, onLogout, userRole }) {
  const [expanded, setExpanded] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Home', Icon: Icons.Home },
    { id: 'reels', label: 'Reels', Icon: Icons.Reels },
    { id: 'media', label: 'My Media', Icon: Icons.Media },
    { id: 'channels', label: 'Channels', Icon: Icons.Channels },
    { id: 'history', label: 'History', Icon: Icons.History },
    { id: 'profile', label: 'Profile', Icon: Icons.Profile }
  ];

  const hasAdminAccess = ['super_admin', 'admin', 'moderator'].includes(userRole);

  if (hasAdminAccess) {
    navItems.push({ id: 'admin', label: 'Admin', Icon: Icons.Admin });
  }

  const handleToggle = () => {
    setExpanded(prev => !prev);
  };

  return (
    <aside className={`sidebar ${expanded ? 'expanded' : ''}`}>
      <div className="brand" onClick={handleToggle} style={{ cursor: 'pointer' }}>
        <div className="brand-icon">
          <Icons.Logo />
        </div>
        <span className="brand-text">AiQMateTube</span>
      </div>
      <nav className="nav">
        {navItems.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-btn ${active === id ? 'active' : ''}`}
            onClick={() => onSelect(id)}
            title={!expanded ? label : ''}
          >
            <div className="nav-icon"><Icon /></div>
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="spacer" />
      <button
        className="nav-btn"
        onClick={onLogout}
        style={{ color: '#c67b7b' }}
        title={!expanded ? 'Sign Out' : ''}
      >
        <div className="nav-icon"><Icons.Logout /></div>
        <span>Sign Out</span>
      </button>
    </aside>
  );
}

function Header({ page, onAdd, user }) {
  const titles = {
    home: { title: 'Home', subtitle: `Welcome back, ${user.displayName || 'User'}` },
    reels: { title: 'Reels', subtitle: 'Short-form vertical videos' },
    media: { title: 'My Media', subtitle: 'Manage content & collaborations' },
    channels: { title: 'Channels', subtitle: 'Discover and subscribe to creators' },
    history: { title: 'Watch History', subtitle: 'Videos you\'ve watched recently' },
    profile: { title: 'Profile', subtitle: 'Manage your account and preferences' },
    admin: { title: 'Admin Panel', subtitle: 'System management and controls' }
  };
  const { title, subtitle } = titles[page] || titles.home;

  const showAddButton = page !== 'admin' && page !== 'channels';

  return (
    <header className="header">
      <div className="header-title">
        <h1>{title}</h1>
        <div className="header-subtitle">{subtitle}</div>
      </div>
      {showAddButton && (
        <div className="header-actions">
          <button className="btn btn-primary" onClick={onAdd}>
            <Icons.Plus />Add Video
          </button>
        </div>
      )}
    </header>
  );
}

function Recorder({ onRecorded, onCancel }) {
  const [recording, setRecording] = React.useState(false);
  const [stream, setStream] = React.useState(null);
  const [recordedBlob, setRecordedBlob] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState(null);
  const liveVideoRef = React.useRef(null);
  const previewVideoRef = React.useRef(null);
  const recorderRef = React.useRef(null);
  const chunksRef = React.useRef([]);

  React.useEffect(() => {
    async function init() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(s);
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = s;
          liveVideoRef.current.play();
        }
      } catch (err) {
        alert('Camera access denied.');
        onCancel();
      }
    }
    init();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  function startRecording() {
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  }

  function stopRecording() {
    if (recorderRef.current) {
      recorderRef.current.stop();
      setRecording(false);
    }
  }

  function handleUseRecording() {
    if (recordedBlob) {
      onRecorded(recordedBlob);
    }
  }

  function handleRetry() {
    setRecordedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    async function reinit() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(s);
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = s;
          liveVideoRef.current.play();
        }
      } catch (err) {
        alert('Camera access denied.');
        onCancel();
      }
    }
    reinit();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="recorder-preview">
        {!recordedBlob ? (
          <video ref={liveVideoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted />
        ) : (
          <video ref={previewVideoRef} src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls />
        )}
      </div>
      <div className="recorder-controls">
        {!recordedBlob ? (
          <>
            {!recording ? (
              <button className="btn btn-primary" onClick={startRecording}>Start Recording</button>
            ) : (
              <button className="btn btn-danger" onClick={stopRecording}>Stop Recording</button>
            )}
            <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn btn-primary" onClick={handleUseRecording} style={{ flex: 1 }}>Use This Recording</button>
            <button className="btn btn-secondary" onClick={handleRetry}>Record Again</button>
            <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}

function AddVideoModal({ onClose, onUpload, userChannels }) {
  const [mode, setMode] = React.useState(null);
  const [file, setFile] = React.useState(null);
  const [url, setUrl] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [videoType, setVideoType] = React.useState('standard');
  const [preview, setPreview] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);
  const [loadingUrl, setLoadingUrl] = React.useState(false);
  const [isYoutube, setIsYoutube] = React.useState(false);
  const [selectedChannel, setSelectedChannel] = React.useState('');

  React.useEffect(() => {
    if (userChannels.length > 0 && !selectedChannel) {
      setSelectedChannel(userChannels[0].id);
    }
  }, [userChannels]);

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  }

  function handleRecorded(blob) {
    setFile(blob);
    setPreview(URL.createObjectURL(blob));
    setMode('file');
    setIsYoutube(false);
  }

  function extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
      /youtube\.com\/shorts\/([^&\?\/]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  async function downloadYoutubeVideo(videoUrl) {
    try {
      const response = await fetch('https://api.cobalt.tools/api/json', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: videoUrl,
          vCodec: 'h264',
          vQuality: '720'
        })
      });

      const data = await response.json();

      if (!data || !data.url) {
        console.error('Cobalt API Error:', data);
        throw new Error('Could not get download link from service');
      }

      const fileUrl = data.url;
      let videoResponse;

      try {
        videoResponse = await fetch(fileUrl);
        if (!videoResponse.ok) throw new Error('Direct fetch failed');
      } catch (err) {
        console.log('Direct fetch failed, trying CORS proxy...');
        const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(fileUrl);
        videoResponse = await fetch(proxyUrl);
      }

      if (!videoResponse || !videoResponse.ok) {
        throw new Error('Failed to download video file via proxy');
      }

      const blob = await videoResponse.blob();
      return blob;
    } catch (error) {
      console.error('YouTube download failed:', error);
      if (error.message.includes('Could not get download link')) {
        throw new Error('Video service could not process this URL. It might be restricted or private.');
      }
      throw new Error('Failed to download video data (CORS/Network error). Try a different video or try again later.');
    }
  }

  async function handleLoadUrl() {
    if (!url.trim()) return alert('Please enter a URL');

    setLoadingUrl(true);
    try {
      const videoId = extractVideoId(url);

      if (videoId) {
        const blob = await downloadYoutubeVideo(url);
        setFile(blob);
        setPreview(URL.createObjectURL(blob));
        setIsYoutube(false);
        setMode('file');
        if (!title) setTitle(`YouTube Video ${videoId}`);
        setLoadingUrl(false);
        return;
      }

      setIsYoutube(false);
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
      const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));

      if (!hasVideoExtension) {
        alert('Please provide a direct video file URL (e.g., ending in .mp4, .webm, etc.) or a valid YouTube link.');
        setLoadingUrl(false);
        return;
      }

      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Failed to fetch video from URL');

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('video/')) {
        throw new Error('URL does not point to a valid video file');
      }

      const blob = await response.blob();
      setFile(blob);
      setPreview(url);
      setLoadingUrl(false);
    } catch (error) {
      let errorMessage = 'Failed to load video from URL: ' + error.message;

      if (error.message.includes('CORS') || error.message.includes('NetworkError')) {
        errorMessage = 'Cannot load video from this URL due to security restrictions.\n\nPlease:\n1. Download the video to your device\n2. Use "Upload File" option instead';
      }

      alert(errorMessage);
      setLoadingUrl(false);
    }
  }

  async function handleSubmit() {
    if (!title.trim()) return alert('Please enter a title');
    if (!file) return alert('Please select or record a video');
    if (userChannels.length === 0) return alert('Please create a channel first');
    if (!selectedChannel) return alert('Please select a channel');

    setUploading(true);
    try {
      await onUpload(file, videoType, title, selectedChannel);
      onClose();
    } catch (e) {
      alert('Upload failed: ' + e.message);
    }
    setUploading(false);
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-surface" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Video</h2>
          <button className="btn btn-ghost" onClick={onClose}><Icons.Close /></button>
        </div>
        <div className="modal-body">
          {!mode && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <button className="btn btn-secondary" onClick={() => setMode('file')} style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Icons.Upload />
                <span>Upload File</span>
              </button>
              <button className="btn btn-secondary" onClick={() => setMode('record')} style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Icons.Camera />
                <span>Record Video</span>
              </button>
              <button className="btn btn-secondary" onClick={() => setMode('url')} style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Icons.Play />
                <span>From URL</span>
              </button>
            </div>
          )}

          {mode === 'file' && !file && (
            <div className="input-group">
              <label>Select Video File</label>
              <input type="file" accept="video/*" onChange={handleFileChange} />
            </div>
          )}

          {mode === 'record' && !file && <Recorder onRecorded={handleRecorded} onCancel={() => setMode(null)} />}

          {mode === 'url' && !file && (
            <div>
              <div className="input-group">
                <label>Video URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/video.mp4"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  Supported: YouTube links or direct video files (.mp4, .webm)
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleLoadUrl}
                disabled={loadingUrl}
                style={{ marginTop: 12, width: '100%' }}
              >
                {loadingUrl ? <div className="loading-sm" /> : 'Load Video'}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setMode(null)}
                style={{ marginTop: 12, width: '100%' }}
              >
                Back
              </button>
            </div>
          )}

          {preview && file && (
            <>
              <div style={{ marginBottom: 24 }}>
                {isYoutube ? (
                  <iframe
                    src={preview}
                    style={{ width: '100%', height: 400, border: 'none', background: 'var(--charcoal)' }}
                    title="Preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={preview}
                    controls
                    style={{ width: '100%', maxHeight: 400, background: 'var(--charcoal)' }}
                  />
                )}
              </div>

              <div className="input-group">
                <label>Video Title</label>
                <input type="text" placeholder="My Amazing Video" value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              <div className="input-group">
                <label>Select Channel</label>
                {userChannels.length === 0 ? (
                  <div style={{ padding: 12, background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 4, color: '#c53030', fontSize: 13 }}>
                    You need to create a channel first. Videos must be published to a channel.
                  </div>
                ) : (
                  <select value={selectedChannel} onChange={e => setSelectedChannel(e.target.value)}>
                    {userChannels.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="input-group">
                <label>Video Type</label>
                <div className="type-selector">
                  <div className={`type-option ${videoType === 'standard' ? 'selected' : ''}`} onClick={() => setVideoType('standard')}>
                    <div className="type-option-title">Standard</div>
                    <div className="type-option-desc">Horizontal Video</div>
                  </div>
                  <div className={`type-option ${videoType === 'reel' ? 'selected' : ''}`} onClick={() => setVideoType('reel')}>
                    <div className="type-option-title">Reel</div>
                    <div className="type-option-desc">Vertical Short</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={uploading || userChannels.length === 0} style={{ flex: 1 }}>
                  {uploading ? <div className="loading-sm" /> : 'Upload Video'}
                </button>
                <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoPlayer({ meta, onClose, onToggleSubscribe, userId, userSubscribedChannels }) {
  const [tracked, setTracked] = React.useState(false);
  const videoRef = React.useRef(null);
  const isSubbed = meta.channelId && userSubscribedChannels.includes(meta.channelId);
  const startTimeRef = React.useRef(Date.now());

  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(meta.likes || 0);

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

  React.useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (!meta.provider || meta.provider !== 'youtube') {
          videoRef.current?.play();
        }
        trackView();
      } catch { }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

  async function onTime() {
    const v = videoRef.current;
    if (!v || tracked || !userId || (meta.provider === 'youtube')) return;
    const progress = v.duration ? (v.currentTime / v.duration) : 0;
    if (v.currentTime >= 5 || progress >= 0.5) {
      try {
        const watchTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
        await addDoc(collection(db, 'users', userId, 'history'), {
          videoId: meta.id,
          title: meta.title,
          channelName: meta.channelName || 'Unknown',
          thumbnail: meta.url,
          watchedAt: new Date().toISOString(),
          progress: Math.min(1, progress),
          watchTime: watchTime,
          videoType: meta.type || 'standard'
        });

        await updateDoc(doc(db, 'videos', meta.id), {
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
    <div className="modal" onClick={onClose}>
      <div className="player" onClick={e => e.stopPropagation()}>
        <div className="player-header">
          <div className="player-info">
            <h2 className="player-title">{meta.title}</h2>
            <div className="player-meta">
              <span className="tag tag-channel">{meta.channelName}</span>
              <span style={{ marginLeft: 12, fontSize: 13, opacity: 0.8 }}>
                {meta.views || 0} views • {likeCount} likes
              </span>
            </div>
          </div>
          <div className="player-actions">
            <button className={`btn ${liked ? 'btn-primary' : 'btn-secondary'}`} onClick={handleLike}>
              {liked ? 'Liked' : 'Like'} ({likeCount})
            </button>
            {meta.channelId && (
              <button className="btn btn-secondary" onClick={() => onToggleSubscribe(meta.channelId)}>
                {isSubbed ? 'Unsubscribe' : 'Subscribe'}
              </button>
            )}
            <button className="btn btn-danger" onClick={onClose}><Icons.Close /></button>
          </div>
        </div>
        {meta.provider === 'youtube' ? (
          <iframe
            src={meta.url}
            className="player-video"
            title={meta.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', aspectRatio: '16/9' }}
          />
        ) : (
          meta.url ? <video ref={videoRef} src={meta.url} className="player-video" controls playsInline onTimeUpdate={onTime} /> : <div className="empty">Error</div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);

  const [active, setActive] = React.useState('home');
  const [videos, setVideos] = React.useState([]);
  const [channels, setChannels] = React.useState([]);
  const [userChannels, setUserChannels] = React.useState([]);
  const [subscribedChannels, setSubscribedChannels] = React.useState([]);
  const [showAdd, setShowAdd] = React.useState(false);
  const [playing, setPlaying] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [userRole, setUserRole] = React.useState('user');
  const [userBanned, setUserBanned] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!user) {
      setUserRole('user');
      setUserBanned(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserRole(userData.role || 'user');
        setUserBanned(userData.banned || false);
        setSubscribedChannels(userData.subscribedChannels || []);
      } else {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          role: 'user',
          subscribedChannels: [],
          banned: false,
          createdAt: new Date().toISOString()
        });
      }
    });
    return () => unsubscribe();
  }, [user]);

  React.useEffect(() => {
    const safetyTimeout = setTimeout(() => { setIsLoading(false); }, 2000);
    const q = query(collection(db, 'videos'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(safetyTimeout);
      const videoList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      videoList.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
      setVideos(videoList);
      setIsLoading(false);
    }, (error) => {
      clearTimeout(safetyTimeout);
      setIsLoading(false);
    });
    return () => { unsubscribe(); clearTimeout(safetyTimeout); };
  }, []);

  React.useEffect(() => {
    const q = query(collection(db, 'channels'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const channelList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChannels(channelList);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!user) {
      setUserChannels([]);
      return;
    }
    const userChannelsList = channels.filter(ch => ch.ownerId === user.uid);
    setUserChannels(userChannelsList);
  }, [channels, user]);

  async function handleUpload(fileOrBlob, kind, title, channelId) {
    if (!user) return alert("Please sign in to upload.");
    if (userBanned) return alert("Your account has been banned. You cannot upload videos.");
    if (!channelId) return alert("Please select a channel.");

    const channel = channels.find(ch => ch.id === channelId);
    if (!channel) return alert("Channel not found.");

    const safeTitle = title.replace(/[^a-z0-9]/gi, '_');

    let downloadURL = '';
    let storagePath = '';
    let provider = 'local';

    if (fileOrBlob.type === 'youtube') {
      downloadURL = `https://www.youtube.com/embed/${fileOrBlob.videoId}`;
      storagePath = '';
      provider = 'youtube';
    } else {
      let extension = 'mp4';
      if (fileOrBlob.name) {
        const parts = fileOrBlob.name.split('.');
        if (parts.length > 1) extension = parts.pop();
      } else if (fileOrBlob.type) {
        const mimeMap = {
          'video/mp4': 'mp4',
          'video/webm': 'webm',
          'video/quicktime': 'mov',
          'video/x-msvideo': 'avi'
        };
        extension = mimeMap[fileOrBlob.type] || 'mp4';
      }

      const fileName = `videos/${Date.now()}_${safeTitle}.${extension}`;
      storagePath = fileName;
      const storageRef = ref(storage, fileName);

      let mimeType = fileOrBlob.type;
      if (!mimeType || !mimeType.startsWith('video/')) mimeType = 'video/mp4';
      const metadata = { contentType: mimeType };

      const snapshot = await uploadBytes(storageRef, fileOrBlob, metadata);
      downloadURL = await getDownloadURL(snapshot.ref);
    }

    await addDoc(collection(db, 'videos'), {
      title: title || 'Untitled',
      type: kind,
      channelId: channelId,
      channelName: channel.name,
      creatorId: user.uid,
      createdAt: new Date().toISOString(),
      url: downloadURL,
      storagePath: storagePath,
      provider: provider,
      published: false,
      collaborators: [],
      views: 0,
      watchTime: 0,
      completions: 0,
      likes: 0,
      shares: 0
    });

    await updateDoc(doc(db, 'channels', channelId), {
      videoCount: increment(1),
      updatedAt: new Date().toISOString()
    });

    setActive('media');
    alert("Upload successful! Your video is in 'My Media'.");
  }

  async function toggleSubscribe(channelId) {
    if (!user) return alert("Sign in to subscribe.");
    if (userBanned) return alert("Your account has been banned.");

    const userRef = doc(db, 'users', user.uid);
    let newSubs = subscribedChannels.includes(channelId)
      ? subscribedChannels.filter(s => s !== channelId)
      : [...subscribedChannels, channelId];

    await setDoc(userRef, { subscribedChannels: newSubs }, { merge: true });

    const channelRef = doc(db, 'channels', channelId);
    if (subscribedChannels.includes(channelId)) {
      await updateDoc(channelRef, { subscribers: increment(-1) });
    } else {
      await updateDoc(channelRef, { subscribers: increment(1) });
    }
  }

  function handleLogout() {
    signOut(auth);
  }

  const homeVideos = videos.filter(v => v.published === true && v.type !== 'reel');
  const reelsVideos = videos.filter(v => v.published === true);

  if (authLoading) return <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}><div className="loading"></div></div>;
  if (!user) return <Auth />;

  if (userBanned) {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 32 }}>
        <div>
          <div style={{ fontSize: 80, marginBottom: 24 }}>🚫</div>
          <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16, fontFamily: 'Playfair Display, serif' }}>
            Account Suspended
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 32, maxWidth: 500 }}>
            Your account has been banned from this platform. Please contact support if you believe this is a mistake.
          </p>
          <button className="btn btn-primary" onClick={handleLogout}>Sign Out</button>
        </div>
      </div>
    );
  }

  const pageProps = {
    onPlay: setPlaying,
    onToggleSubscribe: toggleSubscribe,
    isLoading,
    user,
    channels,
    userChannels,
    subscribedChannels
  };

  return (
    <div className="app">
      <Sidebar active={active} onSelect={setActive} onLogout={handleLogout} userRole={userRole} />
      <main className="main">
        <Header page={active} onAdd={() => setShowAdd(true)} user={user} />
        <div className="content">
          {active === 'home' && <Home videos={homeVideos} {...pageProps} />}
          {active === 'reels' && (
            <Reels
              videos={reelsVideos}
              userId={user.uid}
              onToggleSubscribe={toggleSubscribe}
              subscribedChannels={subscribedChannels}
              isLoading={isLoading}
            />
          )}
          {active === 'media' && <Media videos={videos} {...pageProps} />}
          {active === 'channels' && <Channels {...pageProps} videos={videos} />}
          {active === 'history' && <History userId={user.uid} videos={videos} onReplay={setPlaying} />}
          {active === 'profile' && <Profile videos={videos} channels={userChannels} user={user} />}
          {active === 'admin' && <Admin user={user} />}
        </div>
      </main>
      {showAdd && <AddVideoModal onClose={() => setShowAdd(false)} onUpload={handleUpload} userChannels={userChannels} />}
      {playing && (
        <VideoPlayer
          meta={playing}
          onClose={() => setPlaying(null)}
          onToggleSubscribe={toggleSubscribe}
          userId={user.uid}
          userSubscribedChannels={subscribedChannels}
        />
      )}
    </div>
  );
}