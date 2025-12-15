import React from 'react';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// --- SUB-COMPONENTS FOR THE MODAL ---

function TabButton({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      style={{
        padding: '12px 24px',
        background: 'none',
        border: 'none',
        borderBottom: active ? '2px solid #d4a574' : '2px solid transparent',
        color: active ? '#1a1816' : '#9b9790',
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      {label}
    </button>
  );
}

function EditModal({ video, onClose }) {
  const [activeTab, setActiveTab] = React.useState('details');
  const [title, setTitle] = React.useState(video.title || '');
  const [collabEmail, setCollabEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // TAB 1: DETAILS LOGIC
  async function handleSaveDetails() {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'videos', video.id), { title });
      alert("Title updated!");
    } catch (e) { alert(e.message); }
    setLoading(false);
  }

  // TAB 2: PUBLISH LOGIC
  async function handleTogglePublish() {
    setLoading(true);
    const newStatus = !video.published;
    try {
      await updateDoc(doc(db, 'videos', video.id), { 
        published: newStatus,
        publishedAt: newStatus ? new Date().toISOString() : video.publishedAt
      });
    } catch (e) { alert(e.message); }
    setLoading(false);
  }

  // TAB 3: COLLABORATION LOGIC
  async function handleAddCollaborator(e) {
    e.preventDefault();
    if (!collabEmail.includes('@')) return alert("Invalid email");
    setLoading(true);
    try {
      // Add email to 'collaborators' array in Firestore
      await updateDoc(doc(db, 'videos', video.id), {
        collaborators: arrayUnion(collabEmail)
      });
      setCollabEmail('');
    } catch (e) { alert(e.message); }
    setLoading(false);
  }

  async function handleRemoveCollaborator(email) {
    if (!confirm(`Remove ${email}?`)) return;
    try {
      await updateDoc(doc(db, 'videos', video.id), {
        collaborators: arrayRemove(email)
      });
    } catch (e) { alert(e.message); }
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-surface" onClick={e => e.stopPropagation()} style={{ width: 600 }}>
        <div className="modal-header">
          <h2 className="modal-title">Studio Editor</h2>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        {/* TABS HEADER */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e8e5df', marginBottom: 24 }}>
          <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')} label="Details" />
          <TabButton active={activeTab === 'publish'} onClick={() => setActiveTab('publish')} label="Publish" />
          <TabButton active={activeTab === 'collab'} onClick={() => setActiveTab('collab')} label="Collaboration" />
        </div>

        <div className="modal-body">
          {/* --- TAB 1: DETAILS --- */}
          {activeTab === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Video Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  style={{ fontSize: 16, fontWeight: 500 }}
                />
              </div>
              <div className="input-group">
                <label>File Information</label>
                <div style={{ padding: 12, background: '#faf8f5', border: '1px solid #e8e5df', fontSize: 13, color: '#615e5a' }}>
                  <strong>ID:</strong> {video.id}<br/>
                  <strong>Type:</strong> {video.type}<br/>
                  <strong>Created:</strong> {new Date(video.createdAt).toLocaleString()}
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleSaveDetails} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* --- TAB 2: PUBLISH --- */}
          {activeTab === 'publish' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ 
                fontSize: 14, 
                marginBottom: 16, 
                padding: '8px 16px', 
                background: video.published ? '#e6fffa' : '#fffaf0', 
                color: video.published ? '#2c7a7b' : '#c05621',
                display: 'inline-block',
                borderRadius: 20,
                fontWeight: 700
              }}>
                Current Status: {video.published ? 'LIVE (Public)' : 'DRAFT (Private)'}
              </div>
              
              <p style={{ color: '#615e5a', marginBottom: 24, fontSize: 14 }}>
                {video.published 
                  ? "This video is visible on the Home and Reels pages. Unpublishing will hide it from everyone except you and your collaborators."
                  : "This video is currently hidden. Publishing it will make it visible to all users on the platform."
                }
              </p>

              <button 
                className={`btn ${video.published ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleTogglePublish}
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Processing...' : (video.published ? 'Unpublish Video' : 'Publish Video Now')}
              </button>
            </div>
          )}

          {/* --- TAB 3: COLLABORATION --- */}
          {activeTab === 'collab' && (
            <div>
              <p style={{ fontSize: 13, color: '#615e5a', marginBottom: 16 }}>
                Add team members by email. They will see this video in their "My Media" page and can help manage it.
              </p>

              <form onSubmit={handleAddCollaborator} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <input 
                  type="email" 
                  placeholder="colleague@example.com"
                  value={collabEmail}
                  onChange={e => setCollabEmail(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                <button type="submit" className="btn btn-secondary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label>Current Collaborators</label>
                {(!video.collaborators || video.collaborators.length === 0) && (
                  <div className="small" style={{ fontStyle: 'italic' }}>No collaborators yet.</div>
                )}
                {video.collaborators?.map(email => (
                  <div key={email} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', background: '#faf8f5', border: '1px solid #e8e5df', borderRadius: 4
                  }}>
                    <span style={{ fontSize: 14 }}>{email}</span>
                    <button 
                      onClick={() => handleRemoveCollaborator(email)}
                      style={{ background: 'none', border: 'none', color: '#c53030', cursor: 'pointer', fontSize: 18 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- MAIN MEDIA COMPONENT ---

function MediaItem({ video, onPlay, onEdit, onDelete }) {
  const isPublished = video.published === true;
  const isCollaborator = !video.isOwner; // Passed from parent logic

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div 
        className="video-thumb" 
        onClick={() => onPlay(video)}
        style={{ cursor: 'pointer' }}
      >
        <video src={video.url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div className="video-thumb-overlay">
          <div className="play-icon" style={{ width: 48, height: 48 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        
        {/* Status Badge */}
        <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 8px', borderRadius: 4, background: isPublished ? '#48bb78' : '#ecc94b', color: isPublished ? '#fff' : '#000', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          {isPublished ? 'Public' : 'Private'}
        </div>

        {/* Collab Badge */}
        {isCollaborator && (
          <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 8px', borderRadius: 4, background: '#4299e1', color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            Collab
          </div>
        )}
      </div>

      <div className="video-meta" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 className="video-title" style={{ fontSize: 16 }}>{video.title}</h3>
        <div className="video-info" style={{ marginBottom: 16 }}>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          {video.type === 'reel' && (
            <><span>•</span><span className="tag tag-reel">Reel</span></>
          )}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => onEdit(video)}
            style={{ flex: 1 }}
          >
            Edit / Manage
          </button>
          
          <button 
            className="btn btn-danger" 
            onClick={() => onDelete(video)}
            style={{ padding: '0 12px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Media({ videos, user, onPlay }) {
  const [editingVideo, setEditingVideo] = React.useState(null);

  // FILTER: Show video if I am the Creator OR if my Email is in 'collaborators'
  const myVideos = videos.filter(v => 
    v.creatorId === user.uid || 
    (v.collaborators && v.collaborators.includes(user.email))
  ).map(v => ({
    ...v,
    isOwner: v.creatorId === user.uid // Mark ownership for UI badges
  }));

  async function handleDelete(video) {
    if (!video.isOwner) {
      return alert("Only the owner can delete this video. You can remove yourself from collaborators in the Edit menu.");
    }
    if (!confirm(`Permanently delete "${video.title}"?`)) return;
    try {
      await deleteDoc(doc(db, 'videos', video.id));
    } catch (e) {
      alert("Error deleting: " + e.message);
    }
  }

  if (myVideos.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div className="empty-title">Media Library is Empty</div>
        <div className="empty-text">
          Upload videos or ask a team member to add you as a collaborator.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 className="section-title">My Media</h2>
        <p className="section-subtitle">Manage your uploads and collaborations.</p>
      </div>

      <div className="grid">
        {myVideos.map(video => (
          <MediaItem 
            key={video.id} 
            video={video} 
            onPlay={onPlay} 
            onEdit={setEditingVideo}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {editingVideo && (
        <EditModal 
          video={editingVideo} 
          onClose={() => setEditingVideo(null)} 
        />
      )}
    </div>
  );
}