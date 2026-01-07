import React from 'react';
import { db, storage } from '../firebase';
import { doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- ICONS ---
const Icons = {
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
  Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  Image: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
  Globe: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  Lock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  Tag: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
  List: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
  Users: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Hash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg>,
  Settings: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v6m5.196-13.196l-4.243 4.243m-2.606 2.606l-4.243 4.243m15.698-.707l-4.243-4.243m-2.606-2.606l-4.243-4.243" /></svg>,
  Subtitles: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h4M6 14h8M16 14h2" /></svg>,
  Music: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>,
  DollarSign: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
  Video: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
};

// --- TABS ---
function TabButton({ active, onClick, label, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        background: 'none',
        border: 'none',
        borderBottom: active ? '2px solid var(--accent-gold)' : '2px solid transparent',
        color: active ? 'var(--charcoal)' : 'var(--text-muted)',
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}
    >
      {Icon && <Icon />}
      {label}
    </button>
  );
}

// --- EDIT MODAL ---
function EditModal({ video, onClose, onUpdate, userChannels, channels }) {
  const [activeTab, setActiveTab] = React.useState('details');
  const [loading, setLoading] = React.useState(false);

  // Details Tab
  const [title, setTitle] = React.useState(video.title || '');
  const [description, setDescription] = React.useState(video.description || '');
  const [category, setCategory] = React.useState(video.category || 'Entertainment');
  const [tags, setTags] = React.useState(video.tags || []);
  const [newTag, setNewTag] = React.useState('');

  // Thumbnail Tab
  const [thumbnail, setThumbnail] = React.useState(video.thumbnail || '');
  const [uploadingThumbnail, setUploadingThumbnail] = React.useState(false);

  // Visibility Tab
  const [visibility, setVisibility] = React.useState(video.visibility || (video.published ? 'public' : 'private'));
  const [selectedChannel, setSelectedChannel] = React.useState(video.channelId || '');
  const [scheduledDate, setScheduledDate] = React.useState(video.scheduledDate || '');
  const [ageRestriction, setAgeRestriction] = React.useState(video.ageRestriction || false);
  const [allowComments, setAllowComments] = React.useState(video.allowComments !== false);
  const [allowRatings, setAllowRatings] = React.useState(video.allowRatings !== false);

  // Collaboration Tab
  const [collaborators, setCollaborators] = React.useState(video.collaborators || []);
  const [collabEmail, setCollabEmail] = React.useState('');

  // Monetization Tab
  const [monetized, setMonetized] = React.useState(video.monetized || false);
  const [adBreaks, setAdBreaks] = React.useState(video.adBreaks || []);

  // Subtitles Tab
  const [subtitles, setSubtitles] = React.useState(video.subtitles || []);
  const [newSubtitleLang, setNewSubtitleLang] = React.useState('');

  // Music Tab
  const [soundtrack, setSoundtrack] = React.useState(video.soundtrack || '');
  const [audioLanguage, setAudioLanguage] = React.useState(video.audioLanguage || 'English');

  // Advanced Tab
  const [videoType, setVideoType] = React.useState(video.type || 'standard');
  const [license, setLicense] = React.useState(video.license || 'Standard');
  const [location, setLocation] = React.useState(video.location || '');
  const [recordingDate, setRecordingDate] = React.useState(video.recordingDate || '');
  const [allowEmbedding, setAllowEmbedding] = React.useState(video.allowEmbedding !== false);
  const [publishToFeed, setPublishToFeed] = React.useState(video.publishToFeed !== false);

  React.useEffect(() => {
    if (userChannels.length > 0 && !selectedChannel) {
      setSelectedChannel(userChannels[0].id);
    }
  }, [userChannels]);

  // Save handlers
  async function handleSaveDetails() {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'videos', video.id), {
        title,
        description,
        category,
        tags,
        updatedAt: new Date().toISOString()
      });
      onUpdate?.();
      alert('Details saved!');
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(false);
  }

  async function handleThumbnailUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const storageRef = ref(storage, `thumbnails/${video.id}_${Date.now()}.jpg`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setThumbnail(url);
      await updateDoc(doc(db, 'videos', video.id), { thumbnail: url });
      alert('Thumbnail uploaded!');
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setUploadingThumbnail(false);
  }

  async function handleSaveVisibility() {
    if (visibility === 'public' && !selectedChannel) {
      return alert('Please select a channel to publish this video');
    }

    setLoading(true);
    try {
      const updates = {
        visibility,
        published: visibility === 'public',
        ageRestriction,
        allowComments,
        allowRatings,
        updatedAt: new Date().toISOString()
      };

      if (visibility === 'public') {
        const channel = channels.find(ch => ch.id === selectedChannel);
        if (channel) {
          updates.channelId = selectedChannel;
          updates.channelName = channel.name;
        }
      }

      if (scheduledDate) updates.scheduledDate = scheduledDate;
      await updateDoc(doc(db, 'videos', video.id), updates);
      onUpdate?.();
      alert('Visibility settings saved!');
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(false);
  }

  async function handleAddCollaborator(e) {
    e.preventDefault();
    if (!collabEmail.includes('@')) return alert('Invalid email');
    setLoading(true);
    try {
      await updateDoc(doc(db, 'videos', video.id), {
        collaborators: arrayUnion(collabEmail)
      });
      setCollaborators([...collaborators, collabEmail]);
      setCollabEmail('');
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(false);
  }

  async function handleRemoveCollaborator(email) {
    if (!confirm(`Remove ${email}?`)) return;
    try {
      await updateDoc(doc(db, 'videos', video.id), {
        collaborators: arrayRemove(email)
      });
      setCollaborators(collaborators.filter(c => c !== email));
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }

  async function handleSaveMonetization() {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'videos', video.id), {
        monetized,
        adBreaks,
        updatedAt: new Date().toISOString()
      });
      onUpdate?.();
      alert('Monetization settings saved!');
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(false);
  }

  async function handleSaveSubtitles() {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'videos', video.id), {
        subtitles,
        updatedAt: new Date().toISOString()
      });
      onUpdate?.();
      alert('Subtitles saved!');
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(false);
  }

  async function handleSaveMusic() {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'videos', video.id), {
        soundtrack,
        audioLanguage,
        updatedAt: new Date().toISOString()
      });
      onUpdate?.();
      alert('Music settings saved!');
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(false);
  }

  async function handleSaveAdvanced() {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'videos', video.id), {
        type: videoType,
        license,
        location,
        recordingDate,
        allowEmbedding,
        publishToFeed,
        updatedAt: new Date().toISOString()
      });
      onUpdate?.();
      alert('Advanced settings saved!');
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(false);
  }

  function addTag() {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  }

  function removeTag(tag) {
    setTags(tags.filter(t => t !== tag));
  }

  const tabs = [
    { id: 'details', label: 'Details', icon: Icons.Edit },
    { id: 'thumbnail', label: 'Thumbnail', icon: Icons.Image },
    { id: 'visibility', label: 'Visibility', icon: Icons.Eye },
    { id: 'collaboration', label: 'Collaboration', icon: Icons.Users },
    { id: 'subtitles', label: 'Subtitles', icon: Icons.Subtitles },
    { id: 'music', label: 'Music', icon: Icons.Music },
    { id: 'monetization', label: 'Monetization', icon: Icons.DollarSign },
    { id: 'advanced', label: 'Advanced', icon: Icons.Settings },
  ];

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-surface" onClick={e => e.stopPropagation()} style={{ maxWidth: 1000, width: '95%' }}>
        <div className="modal-header">
          <h2 className="modal-title">Video Editor</h2>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto', padding: '0 24px' }}>
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              label={tab.label}
              icon={tab.icon}
            />
          ))}
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

          {/* DETAILS TAB */}
          {activeTab === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="input-group">
                <label><Icons.Edit /> Video Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter video title"
                  maxLength={100}
                />
                <div className="small">{title.length}/100 characters</div>
              </div>

              <div className="input-group">
                <label><Icons.List /> Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell viewers about your video"
                  rows={6}
                  maxLength={5000}
                />
                <div className="small">{description.length}/5000 characters</div>
              </div>

              <div className="input-group">
                <label><Icons.Tag /> Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Education">Education</option>
                  <option value="Music">Music</option>
                  <option value="Gaming">Gaming</option>
                  <option value="News">News & Politics</option>
                  <option value="Sports">Sports</option>
                  <option value="Technology">Technology</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Travel">Travel</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Film">Film & Animation</option>
                  <option value="Science">Science & Tech</option>
                </select>
              </div>

              <div className="input-group">
                <label><Icons.Hash /> Tags</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button className="btn btn-secondary" onClick={addTag}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {tags.map(tag => (
                    <div key={tag} style={{
                      padding: '6px 12px',
                      background: 'var(--accent-gold)',
                      color: 'var(--charcoal)',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary" onClick={handleSaveDetails} disabled={loading}>
                {loading ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          )}

          {/* THUMBNAIL TAB */}
          {activeTab === 'thumbnail' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 12 }}><Icons.Image /> Video Thumbnail</label>
                {thumbnail && (
                  <img
                    src={thumbnail}
                    alt="Thumbnail"
                    style={{ width: '100%', maxWidth: 400, borderRadius: 4, marginBottom: 16, border: '1px solid var(--border)' }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  disabled={uploadingThumbnail}
                />
                {uploadingThumbnail && <div className="small">Uploading...</div>}
              </div>
              <div className="small" style={{ padding: 16, background: 'var(--off-white)', borderRadius: 4 }}>
                <strong>Tips for great thumbnails:</strong>
                <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                  <li>Use high-resolution images (1280x720 recommended)</li>
                  <li>Include clear, readable text</li>
                  <li>Show faces or expressive imagery</li>
                  <li>Use bright, contrasting colors</li>
                </ul>
              </div>
            </div>
          )}

          {/* VISIBILITY TAB */}
          {activeTab === 'visibility' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="input-group">
                <label><Icons.Eye /> Visibility</label>
                <select value={visibility} onChange={e => setVisibility(e.target.value)}>
                  <option value="public">Public - Anyone can see</option>
                  <option value="unlisted">Unlisted - Anyone with link</option>
                  <option value="private">Private - Only you and collaborators</option>
                  <option value="scheduled">Scheduled - Publish later</option>
                </select>
              </div>

              {visibility === 'public' && (
                <div className="input-group">
                  <label>Select Channel *</label>
                  {userChannels.length === 0 ? (
                    <div style={{ padding: 12, background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 4, color: '#c53030', fontSize: 13 }}>
                      You need to create a channel first. Public videos must be published to a channel.
                    </div>
                  ) : (
                    <select value={selectedChannel} onChange={e => setSelectedChannel(e.target.value)}>
                      {userChannels.map(ch => (
                        <option key={ch.id} value={ch.id}>{ch.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {visibility === 'scheduled' && (
                <div className="input-group">
                  <label><Icons.Calendar /> Schedule Date</label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, background: 'var(--off-white)', borderRadius: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={ageRestriction}
                    onChange={e => setAgeRestriction(e.target.checked)}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>Age Restriction (18+)</div>
                    <div className="small">Restrict to viewers 18 and older</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={e => setAllowComments(e.target.checked)}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>Allow Comments</div>
                    <div className="small">Viewers can comment on this video</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={allowRatings}
                    onChange={e => setAllowRatings(e.target.checked)}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>Allow Ratings</div>
                    <div className="small">Viewers can like/dislike this video</div>
                  </div>
                </label>
              </div>

              <button className="btn btn-primary" onClick={handleSaveVisibility} disabled={loading}>
                {loading ? 'Saving...' : 'Save Visibility Settings'}
              </button>
            </div>
          )}

          {/* COLLABORATION TAB */}
          {activeTab === 'collaboration' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="small" style={{ padding: 12, background: 'var(--off-white)', borderRadius: 4 }}>
                <Icons.Users /> Add team members who can help manage this video. They'll see it in their Media page.
              </div>

              <form onSubmit={handleAddCollaborator} style={{ display: 'flex', gap: 8 }}>
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

              <div>
                <label style={{ display: 'block', marginBottom: 12 }}>Current Collaborators ({collaborators.length})</label>
                {collaborators.length === 0 && (
                  <div className="small" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    No collaborators yet
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {collaborators.map(email => (
                    <div key={email} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 12,
                      background: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: 4
                    }}>
                      <span style={{ fontSize: 14 }}>{email}</span>
                      <button
                        onClick={() => handleRemoveCollaborator(email)}
                        className="btn btn-ghost"
                        style={{ padding: '6px 12px' }}
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUBTITLES TAB */}
          {activeTab === 'subtitles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="small" style={{ padding: 12, background: 'var(--off-white)', borderRadius: 4 }}>
                <Icons.Subtitles /> Add subtitles to make your content accessible to more viewers.
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Language (e.g., English, Spanish)"
                  value={newSubtitleLang}
                  onChange={e => setNewSubtitleLang(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    if (newSubtitleLang) {
                      setSubtitles([...subtitles, { language: newSubtitleLang, url: '' }]);
                      setNewSubtitleLang('');
                    }
                  }}
                >
                  Add Language
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {subtitles.map((sub, idx) => (
                  <div key={idx} style={{
                    padding: 16,
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 4
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>{sub.language}</div>
                    <input
                      type="file"
                      accept=".srt,.vtt"
                      onChange={(e) => {
                        console.log('Upload subtitle for', sub.language);
                      }}
                    />
                    <button
                      className="btn btn-ghost"
                      style={{ marginTop: 8 }}
                      onClick={() => setSubtitles(subtitles.filter((_, i) => i !== idx))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary" onClick={handleSaveSubtitles} disabled={loading}>
                {loading ? 'Saving...' : 'Save Subtitles'}
              </button>
            </div>
          )}

          {/* MUSIC TAB */}
          {activeTab === 'music' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="input-group">
                <label><Icons.Music /> Soundtrack / Background Music</label>
                <input
                  type="text"
                  value={soundtrack}
                  onChange={e => setSoundtrack(e.target.value)}
                  placeholder="Song name and artist"
                />
              </div>

              <div className="input-group">
                <label>Audio Language</label>
                <select value={audioLanguage} onChange={e => setAudioLanguage(e.target.value)}>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="Mandarin">Mandarin</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button className="btn btn-primary" onClick={handleSaveMusic} disabled={loading}>
                {loading ? 'Saving...' : 'Save Music Settings'}
              </button>
            </div>
          )}

          {/* MONETIZATION TAB */}
          {activeTab === 'monetization' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ padding: 16, background: 'var(--off-white)', borderRadius: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={monetized}
                    onChange={e => setMonetized(e.target.checked)}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}><Icons.DollarSign /> Enable Monetization</div>
                    <div className="small">Allow ads on this video to earn revenue</div>
                  </div>
                </label>
              </div>

              {monetized && (
                <div className="input-group">
                  <label>Ad Break Positions (in seconds)</label>
                  <input
                    type="text"
                    placeholder="e.g., 30, 60, 120"
                    value={adBreaks.join(', ')}
                    onChange={e => setAdBreaks(e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)))}
                  />
                  <div className="small">Add mid-roll ads at specific timestamps</div>
                </div>
              )}

              <button className="btn btn-primary" onClick={handleSaveMonetization} disabled={loading}>
                {loading ? 'Saving...' : 'Save Monetization Settings'}
              </button>
            </div>
          )}

          {/* ADVANCED TAB */}
          {activeTab === 'advanced' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="input-group">
                <label><Icons.Video /> Video Type</label>
                <select value={videoType} onChange={e => setVideoType(e.target.value)}>
                  <option value="standard">Standard Video</option>
                  <option value="reel">Reel (Vertical Short)</option>
                </select>
              </div>

              <div className="input-group">
                <label>License</label>
                <select value={license} onChange={e => setLicense(e.target.value)}>
                  <option value="Standard">Standard YouTube License</option>
                  <option value="Creative Commons">Creative Commons - Attribution</option>
                </select>
              </div>

              <div className="input-group">
                <label><Icons.Globe /> Recording Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="City, Country"
                />
              </div>

              <div className="input-group">
                <label><Icons.Calendar /> Recording Date</label>
                <input
                  type="date"
                  value={recordingDate}
                  onChange={e => setRecordingDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, background: 'var(--off-white)', borderRadius: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={allowEmbedding}
                    onChange={e => setAllowEmbedding(e.target.checked)}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>Allow Embedding</div>
                    <div className="small">Let others embed this video on their websites</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={publishToFeed}
                    onChange={e => setPublishToFeed(e.target.checked)}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>Publish to Subscriptions Feed</div>
                    <div className="small">Notify subscribers about this video</div>
                  </div>
                </label>
              </div>

              <button className="btn btn-primary" onClick={handleSaveAdvanced} disabled={loading}>
                {loading ? 'Saving...' : 'Save Advanced Settings'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// --- MEDIA ITEM CARD ---
function MediaItem({ video, onPlay, onEdit, onDelete }) {
  const isPublished = video.published === true;
  const isCollaborator = !video.isOwner;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="video-thumb" onClick={() => onPlay(video)} style={{ cursor: 'pointer' }}>
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <video src={video.url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div className="video-thumb-overlay">
          <div className="play-icon" style={{ width: 48, height: 48 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>

        <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 8px', borderRadius: 4, background: isPublished ? '#48bb78' : '#ecc94b', color: isPublished ? '#fff' : '#000', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          {isPublished ? 'Public' : 'Private'}
        </div>

        {isCollaborator && (
          <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 8px', borderRadius: 4, background: '#4299e1', color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            Collab
          </div>
        )}
      </div>

      <div className="video-meta" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 className="video-title" style={{ fontSize: 16 }}>{video.title}</h3>
        <div className="video-info" style={{ marginBottom: 12 }}>
          <span><Icons.Eye /> {video.views || 0} views</span>
          <span>•</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          {video.type === 'reel' && (
            <><span>•</span><span className="tag tag-reel">Reel</span></>
          )}
        </div>
        {video.channelName && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            Channel: {video.channelName}
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => onEdit(video)} style={{ flex: 1 }}>
            <Icons.Edit /> Edit
          </button>
          <button className="btn btn-danger" onClick={() => onDelete(video)} style={{ padding: '0 12px' }}>
            <Icons.Trash />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN MEDIA COMPONENT ---
export default function Media({ videos, user, onPlay, userChannels, channels }) {
  const [editingVideo, setEditingVideo] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('newest');

  const myVideos = videos
    .filter(v => v.creatorId === user.uid || (v.collaborators && v.collaborators.includes(user.email)))
    .map(v => ({ ...v, isOwner: v.creatorId === user.uid }))
    .filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesType = true;
      if (filterType === 'public') matchesType = v.published === true;
      if (filterType === 'private') matchesType = !v.published;
      if (filterType === 'collab') matchesType = !v.isOwner;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  async function handleDelete(video) {
    if (!video.isOwner) {
      return alert('Only the owner can delete this video. You can remove yourself from collaborators in the Edit menu.');
    }
    if (!confirm(`Permanently delete "${video.title}"?`)) return;
    try {
      await deleteDoc(doc(db, 'videos', video.id));
    } catch (e) {
      alert('Error deleting: ' + e.message);
    }
  }

  const stats = {
    total: myVideos.length,
    public: myVideos.filter(v => v.published).length,
    private: myVideos.filter(v => !v.published).length,
    collab: myVideos.filter(v => !v.isOwner).length,
    totalViews: myVideos.reduce((sum, v) => sum + (v.views || 0), 0),
    totalLikes: myVideos.reduce((sum, v) => sum + (v.likes || 0), 0),
  };

  return (
    <div>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-gold)' }}>{stats.total}</div>
          <div className="small">Total Videos</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#48bb78' }}>{stats.public}</div>
          <div className="small">Public</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#ecc94b' }}>{stats.private}</div>
          <div className="small">Private</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#4299e1' }}>{stats.collab}</div>
          <div className="small">Collaborations</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-navy)' }}>{stats.totalViews}</div>
          <div className="small">Total Views</div>
        </div>
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-rose)' }}>{stats.totalLikes}</div>
          <div className="small">Total Likes</div>
        </div>
      </div>

      {/* Search, Filter & Sort */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search your videos..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '10px 16px', borderRadius: 4, border: '1px solid var(--border)', background: '#fff', fontSize: 14 }}
        />

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '10px 16px', borderRadius: 4, border: '1px solid var(--border)', background: '#fff', fontSize: 14 }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="views">Most Views</option>
          <option value="title">Title (A-Z)</option>
        </select>

        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'public', label: 'Public' },
            { id: 'private', label: 'Private' },
            { id: 'collab', label: 'Collabs' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilterType(opt.id)}
              className={`btn ${filterType === opt.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 16px', fontSize: 12 }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {myVideos.length === 0 ? (
        <div className="empty" style={{ marginTop: 40 }}>
          {videos.length === 0 ? (
            <>
              <div className="empty-icon"><Icons.Video /></div>
              <div className="empty-title">Media Library is Empty</div>
              <div className="empty-text">Upload videos or ask a team member to add you as a collaborator.</div>
            </>
          ) : (
            <div className="empty-text">No videos match your search filters.</div>
          )}
        </div>
      ) : (
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
      )}

      {editingVideo && (
        <EditModal
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
          onUpdate={() => { }}
          userChannels={userChannels}
          channels={channels}
        />
      )}
    </div>
  );
}