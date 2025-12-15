import React from 'react';
import Home from './pages/Home';
import Reels from './pages/Reels';
import History from './pages/History';
import Subscriptions from './pages/Subscriptions';
import Profile from './pages/Profile';
import Media from './pages/Media';
import Auth from './pages/Auth';

// Firebase Imports
import { db, storage, auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  doc, 
  setDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

// Icons
const Icons = {
  Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Reels: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>,
  History: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Subscriptions: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>,
  Profile: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Media: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Play: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Camera: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Logo: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4a574" />
          <stop offset="100%" stopColor="#b88a5a" />
        </linearGradient>
      </defs>
      {/* Outer circle with gradient */}
      <circle cx="16" cy="16" r="15" fill="url(#logoGrad)" stroke="#0a0b0e" strokeWidth="1"/>
      {/* Play button triangle */}
      <path d="M13 10.5 L13 21.5 L22 16 Z" fill="#0a0b0e" stroke="#0a0b0e" strokeWidth="0.5" strokeLinejoin="round"/>
      {/* Subtle film strip accent on left */}
      <rect x="6" y="12" width="2" height="8" fill="rgba(10,11,14,0.3)" rx="0.5"/>
      <rect x="6" y="13" width="2" height="1.5" fill="#0a0b0e" opacity="0.2"/>
      <rect x="6" y="17.5" width="2" height="1.5" fill="#0a0b0e" opacity="0.2"/>
      {/* Shine/reflection effect */}
      <path d="M 10 6 Q 16 8, 22 6" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  Logout: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
};

function Sidebar({ active, onSelect, onLogout }) {
  const [expanded, setExpanded] = React.useState(false);
  
  const navItems = [
    { id: 'home', label: 'Home', Icon: Icons.Home },
    { id: 'reels', label: 'Reels', Icon: Icons.Reels },
    { id: 'media', label: 'My Media', Icon: Icons.Media },
    { id: 'history', label: 'History', Icon: Icons.History },
    { id: 'subs', label: 'Subscriptions', Icon: Icons.Subscriptions },
    { id: 'profile', label: 'Profile', Icon: Icons.Profile }
  ];

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
        style={{color: '#c67b7b'}}
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
    history: { title: 'Watch History', subtitle: 'Videos you\'ve watched recently' },
    subs: { title: 'Subscriptions', subtitle: 'Content from channels you follow' },
    profile: { title: 'Profile', subtitle: 'Manage your account and preferences' }
  };
  const { title, subtitle } = titles[page] || titles.home;

  return (
    <header className="header">
      <div className="header-title">
        <h1>{title}</h1>
        <div className="header-subtitle">{subtitle}</div>
      </div>
      <div className="header-actions">
        <button className="btn btn-primary" onClick={onAdd}>
          <Icons.Plus />Add Video
        </button>
      </div>
    </header>
  );
}

// ... Recorder and AddVideoModal ... 
function Recorder({ onRecorded, onCancel }) {
  const [recording, setRecording] = React.useState(false);
  const [stream, setStream] = React.useState(null);
  const videoRef = React.useRef(null);
  const recorderRef = React.useRef(null);
  const chunksRef = React.useRef([]);

  React.useEffect(() => {
    async function init() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
      } catch (err) {
        alert('Camera access denied.');
        onCancel();
      }
    }
    init();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
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
      onRecorded(blob);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  }

  function stopRecording() {
    if (recorderRef.current && recording) {
      recorderRef.current.stop();
      setRecording(false);
    }
  }

  return (
    <div>
      <div className="recorder-preview">
        <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div className="recorder-controls">
        {!recording ? (
          <>
            <button className="btn btn-primary" onClick={startRecording}><Icons.Camera /> Start Recording</button>
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </>
        ) : (
          <button className="btn btn-danger" onClick={stopRecording}>Stop Recording</button>
        )}
      </div>
    </div>
  );
}

function AddVideoModal({ onClose, onUpload }) {
  const [step, setStep] = React.useState('choose');
  const [file, setFile] = React.useState(null);
  const [blob, setBlob] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [kind, setKind] = React.useState('regular');
  const [isUploading, setIsUploading] = React.useState(false);

  function onFileChange(e) {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setTitle(f.name.replace(/\.[^/.]+$/, ''));
      setPreviewUrl(URL.createObjectURL(f));
      setStep('kind');
    }
  }

  function onRecorded(b) {
    setBlob(b);
    setTitle('Recorded Video');
    setPreviewUrl(URL.createObjectURL(b));
    setStep('kind');
  }

  async function onSubmit() {
    setIsUploading(true);
    try {
      if (file) await onUpload(file, kind, title);
      else if (blob) await onUpload(blob, kind, title);
      onClose();
    } catch (error) {
      console.error(error);
      alert(`Upload failed: ${error.message}`);
      setIsUploading(false);
    }
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-surface" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Video</h2>
          <button className="btn btn-ghost" onClick={onClose} disabled={isUploading}><Icons.Close /></button>
        </div>
        <div className="modal-body">
          {isUploading ? (
             <div className="empty"><div className="loading" /><p style={{marginTop: 16}}>Uploading...</p></div>
          ) : (
            <>
              {step === 'choose' && (
                <div className="row">
                  <button className="btn btn-primary" onClick={() => setStep('upload')} style={{ flex: 1 }}><Icons.Upload /> Upload File</button>
                  <button className="btn btn-secondary" onClick={() => setStep('record')} style={{ flex: 1 }}><Icons.Camera /> Record Video</button>
                </div>
              )}
              {step === 'upload' && <><input type="file" accept="video/*" onChange={onFileChange} /><div className="small">Select video file.</div></>}
              {step === 'record' && <Recorder onRecorded={onRecorded} onCancel={() => setStep('choose')} />}
              {step === 'kind' && (
                <div className="row" style={{ gap: 20 }}>
                  <div style={{ flex: 2 }}><label>Preview</label><div className="video-thumb">{previewUrl && <video src={previewUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}</div></div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div><label>Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} /></div>
                    <div><label>Type</label>
                      <div className="type-selector">
                        <div className={`type-option ${kind === 'regular' ? 'selected' : ''}`} onClick={() => setKind('regular')}><div>Regular</div></div>
                        <div className={`type-option ${kind === 'reel' ? 'selected' : ''}`} onClick={() => setKind('reel')}><div>Reel</div></div>
                      </div>
                    </div>
                    <div className="small" style={{color: '#c67b7b'}}>Video will be private until you publish it from your Media page.</div>
                    <button className="btn btn-primary" onClick={onSubmit} style={{ marginTop: 'auto' }}>Upload</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function VideoPlayer({ meta, onClose, subscriptions, onToggleSubscribe, userId }) {
  const [tracked, setTracked] = React.useState(false);
  const videoRef = React.useRef(null);
  const isSubbed = subscriptions.includes(meta.channelName);

  React.useEffect(() => {
    const timer = setTimeout(() => { try { videoRef.current?.play(); } catch {} }, 100);
    return () => clearTimeout(timer);
  }, []);

  async function onTime() {
    const v = videoRef.current;
    if (!v || tracked || !userId) return;
    const progress = v.duration ? (v.currentTime / v.duration) : 0;
    if (v.currentTime >= 5 || progress >= 0.5) {
      try {
        await addDoc(collection(db, 'users', userId, 'history'), {
          videoId: meta.id,
          title: meta.title,
          channelName: meta.channelName || 'Unknown',
          watchedAt: new Date().toISOString(),
          progress: Math.min(1, progress)
        });
      } catch (e) {}
      setTracked(true);
    }
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="player" onClick={e => e.stopPropagation()}>
        <div className="player-header">
          <div className="player-info">
            <h2 className="player-title">{meta.title}</h2>
            <div className="player-meta"><span className="tag tag-channel">{meta.channelName}</span></div>
          </div>
          <div className="player-actions">
            {meta.channelName && meta.channelName !== 'You' && (
              <button className="btn btn-secondary" onClick={() => onToggleSubscribe(meta.channelName)}>{isSubbed ? 'Unsub' : 'Subscribe'}</button>
            )}
            <button className="btn btn-danger" onClick={onClose}><Icons.Close /></button>
          </div>
        </div>
        {meta.url ? <video ref={videoRef} src={meta.url} className="player-video" controls playsInline onTimeUpdate={onTime} /> : <div className="empty">Error</div>}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);

  const [active, setActive] = React.useState('home');
  const [videos, setVideos] = React.useState([]);
  const [subscriptions, setSubscriptions] = React.useState([]);
  const [showAdd, setShowAdd] = React.useState(false);
  const [playing, setPlaying] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
    if (!user) {
      setSubscriptions([]);
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setSubscriptions(docSnap.data().subscriptions || []);
      } else {
        setDoc(userRef, { subscriptions: [] });
      }
    });
    return () => unsubscribe();
  }, [user]);

  async function handleUpload(fileOrBlob, kind, title) {
    if (!user) return alert("Please sign in to upload.");
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_');
    let extension = 'mp4';
    if (fileOrBlob.name) {
      const parts = fileOrBlob.name.split('.');
      if (parts.length > 1) extension = parts.pop();
    }
    const fileName = `videos/${Date.now()}_${safeTitle}.${extension}`;
    const storageRef = ref(storage, fileName);

    let mimeType = fileOrBlob.type;
    if (!mimeType || !mimeType.startsWith('video/')) mimeType = 'video/mp4'; 
    const metadata = { contentType: mimeType };

    const snapshot = await uploadBytes(storageRef, fileOrBlob, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Initializing 'collaborators' as empty array is crucial for the Media page logic
    await addDoc(collection(db, 'videos'), {
      title: title || 'Untitled',
      type: kind,
      channelName: user.displayName || 'Anonymous',
      creatorId: user.uid,
      createdAt: new Date().toISOString(),
      url: downloadURL,
      storagePath: fileName,
      published: false,
      collaborators: [] // Initialize array
    });
    
    setActive('media');
    alert("Upload successful! Your video is in 'My Media'.");
  }

  async function toggleSubscribe(channel) {
    if (!user) return alert("Sign in to subscribe.");
    const userRef = doc(db, 'users', user.uid);
    let newSubs = subscriptions.includes(channel) 
      ? subscriptions.filter(s => s !== channel)
      : [...subscriptions, channel];
    await setDoc(userRef, { subscriptions: newSubs }, { merge: true });
  }

  function handleLogout() {
    signOut(auth);
  }

  const homeVideos = videos.filter(v => v.published === true);
  const reelsVideos = videos.filter(v => v.published === true);

  if (authLoading) return <div style={{height: '100vh', display: 'grid', placeItems: 'center'}}><div className="loading"></div></div>;
  if (!user) return <Auth />;

  const pageProps = { onPlay: setPlaying, onToggleSubscribe: toggleSubscribe, subscriptions, isLoading, user };

  return (
    <div className="app">
      <Sidebar active={active} onSelect={setActive} onLogout={handleLogout} />
      <main className="main">
        <Header page={active} onAdd={() => setShowAdd(true)} user={user} />
        <div className="content">
          {active === 'home' && <Home videos={homeVideos} {...pageProps} />}
          {active === 'reels' && <Reels videos={reelsVideos} {...pageProps} />}
          
          {/* Media page receives ALL videos, filters inside */}
          {active === 'media' && <Media videos={videos} {...pageProps} />}
          
          {active === 'history' && <History userId={user.uid} onReplay={(id) => { const v = videos.find(vid => vid.id === id); if(v) setPlaying(v); }} />}
          {active === 'subs' && <Subscriptions videos={homeVideos} {...pageProps} />}
          {active === 'profile' && <Profile videos={videos} subscriptions={subscriptions} user={user} />}
        </div>
      </main>
      {showAdd && <AddVideoModal onClose={() => setShowAdd(false)} onUpload={handleUpload} />}
      {playing && <VideoPlayer meta={playing} onClose={() => setPlaying(null)} subscriptions={subscriptions} onToggleSubscribe={toggleSubscribe} userId={user.uid} />}
    </div>
  );
}