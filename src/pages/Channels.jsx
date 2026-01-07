import React from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Icons = {
    Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
    Image: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
    Users: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    Video: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
    Bell: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
};

function CreateChannelModal({ onClose, user }) {
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [avatar, setAvatar] = React.useState('');
    const [banner, setBanner] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
    const [uploadingBanner, setUploadingBanner] = React.useState(false);

    async function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingAvatar(true);
        try {
            const storageRef = ref(storage, `channels/avatars/${user.uid}_${Date.now()}.jpg`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setAvatar(url);
        } catch (e) {
            alert('Error uploading avatar: ' + e.message);
        }
        setUploadingAvatar(false);
    }

    async function handleBannerUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingBanner(true);
        try {
            const storageRef = ref(storage, `channels/banners/${user.uid}_${Date.now()}.jpg`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setBanner(url);
        } catch (e) {
            alert('Error uploading banner: ' + e.message);
        }
        setUploadingBanner(false);
    }

    async function handleCreate() {
        if (!name.trim()) return alert('Please enter a channel name');

        setLoading(true);
        try {
            await addDoc(collection(db, 'channels'), {
                name: name.trim(),
                description: description.trim(),
                avatar: avatar || '',
                banner: banner || '',
                ownerId: user.uid,
                ownerName: user.displayName || user.email,
                subscribers: 0,
                videoCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            alert('Channel created successfully!');
            onClose();
        } catch (e) {
            alert('Error creating channel: ' + e.message);
        }
        setLoading(false);
    }

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-surface" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
                <div className="modal-header">
                    <h2 className="modal-title">Create New Channel</h2>
                    <button className="btn btn-ghost" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="input-group">
                        <label>Channel Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="My Awesome Channel"
                            maxLength={50}
                        />
                        <div className="small">{name.length}/50 characters</div>
                    </div>

                    <div className="input-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Tell viewers about your channel"
                            rows={4}
                            maxLength={500}
                        />
                        <div className="small">{description.length}/500 characters</div>
                    </div>

                    <div className="input-group">
                        <label><Icons.Image /> Channel Avatar</label>
                        {avatar && (
                            <img
                                src={avatar}
                                alt="Avatar"
                                style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }}
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={uploadingAvatar}
                        />
                        {uploadingAvatar && <div className="small">Uploading...</div>}
                    </div>

                    <div className="input-group">
                        <label><Icons.Image /> Channel Banner</label>
                        {banner && (
                            <img
                                src={banner}
                                alt="Banner"
                                style={{ width: '100%', height: 120, objectFit: 'cover', marginBottom: 12, borderRadius: 4 }}
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            disabled={uploadingBanner}
                        />
                        {uploadingBanner && <div className="small">Uploading...</div>}
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                        <button className="btn btn-primary" onClick={handleCreate} disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Creating...' : 'Create Channel'}
                        </button>
                        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EditChannelModal({ channel, onClose }) {
    const [name, setName] = React.useState(channel.name || '');
    const [description, setDescription] = React.useState(channel.description || '');
    const [avatar, setAvatar] = React.useState(channel.avatar || '');
    const [banner, setBanner] = React.useState(channel.banner || '');
    const [loading, setLoading] = React.useState(false);
    const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
    const [uploadingBanner, setUploadingBanner] = React.useState(false);

    async function handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingAvatar(true);
        try {
            const storageRef = ref(storage, `channels/avatars/${channel.id}_${Date.now()}.jpg`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setAvatar(url);
        } catch (e) {
            alert('Error uploading avatar: ' + e.message);
        }
        setUploadingAvatar(false);
    }

    async function handleBannerUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingBanner(true);
        try {
            const storageRef = ref(storage, `channels/banners/${channel.id}_${Date.now()}.jpg`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setBanner(url);
        } catch (e) {
            alert('Error uploading banner: ' + e.message);
        }
        setUploadingBanner(false);
    }

    async function handleSave() {
        if (!name.trim()) return alert('Please enter a channel name');

        setLoading(true);
        try {
            await updateDoc(doc(db, 'channels', channel.id), {
                name: name.trim(),
                description: description.trim(),
                avatar,
                banner,
                updatedAt: new Date().toISOString()
            });
            alert('Channel updated successfully!');
            onClose();
        } catch (e) {
            alert('Error updating channel: ' + e.message);
        }
        setLoading(false);
    }

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-surface" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
                <div className="modal-header">
                    <h2 className="modal-title">Edit Channel</h2>
                    <button className="btn btn-ghost" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="input-group">
                        <label>Channel Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="My Awesome Channel"
                            maxLength={50}
                        />
                        <div className="small">{name.length}/50 characters</div>
                    </div>

                    <div className="input-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Tell viewers about your channel"
                            rows={4}
                            maxLength={500}
                        />
                        <div className="small">{description.length}/500 characters</div>
                    </div>

                    <div className="input-group">
                        <label><Icons.Image /> Channel Avatar</label>
                        {avatar && (
                            <img
                                src={avatar}
                                alt="Avatar"
                                style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }}
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={uploadingAvatar}
                        />
                        {uploadingAvatar && <div className="small">Uploading...</div>}
                    </div>

                    <div className="input-group">
                        <label><Icons.Image /> Channel Banner</label>
                        {banner && (
                            <img
                                src={banner}
                                alt="Banner"
                                style={{ width: '100%', height: 120, objectFit: 'cover', marginBottom: 12, borderRadius: 4 }}
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            disabled={uploadingBanner}
                        />
                        {uploadingBanner && <div className="small">Uploading...</div>}
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                        <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChannelCard({ channel, videos, onPlay, onToggleSubscribe, isSubscribed, isOwner, onEdit, onDelete }) {
    const channelVideos = videos.filter(v => v.channelId === channel.id && v.published);
    const [expanded, setExpanded] = React.useState(false);

    return (
        <div style={{ marginBottom: 32 }}>
            {/* Channel Banner */}
            {channel.banner && (
                <div style={{
                    width: '100%',
                    height: 200,
                    background: `url(${channel.banner})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 4,
                    marginBottom: 16
                }} />
            )}

            {/* Channel Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: 16,
                background: '#fff',
                borderRadius: 4,
                border: '1px solid var(--border)',
                marginBottom: 16
            }}>
                <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: channel.avatar ? `url(${channel.avatar})` : 'var(--accent-gold)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                        fontSize: 32,
                        color: '#fff',
                        flexShrink: 0
                    }}>
                        {!channel.avatar && channel.name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, fontFamily: 'Playfair Display, serif' }}>
                            {channel.name}
                        </h3>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                            <Icons.Users /> {channel.subscribers || 0} subscribers • <Icons.Video /> {channelVideos.length} videos
                        </div>
                        {channel.description && (
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 8 }}>
                                {channel.description}
                            </p>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {isOwner ? (
                        <>
                            <button className="btn btn-secondary" onClick={() => onEdit(channel)}>
                                <Icons.Edit /> Edit
                            </button>
                            <button className="btn btn-danger" onClick={() => onDelete(channel)}>
                                <Icons.Trash />
                            </button>
                        </>
                    ) : (
                        <button
                            className={`btn ${isSubscribed ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => onToggleSubscribe(channel.id)}
                        >
                            <Icons.Bell /> {isSubscribed ? 'Subscribed' : 'Subscribe'}
                        </button>
                    )}
                    <button
                        className="btn btn-ghost"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? 'Hide' : 'Show'} Videos
                    </button>
                </div>
            </div>

            {/* Channel Videos */}
            {expanded && channelVideos.length > 0 && (
                <div className="grid">
                    {channelVideos.map(video => (
                        <div key={video.id} className="card">
                            <div className="video-thumb" onClick={() => onPlay(video)}>
                                {video.thumbnail ? (
                                    <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <video src={video.url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                                <div className="video-thumb-overlay">
                                    <div className="play-icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="video-meta">
                                <h3 className="video-title">{video.title}</h3>
                                <div className="video-info">
                                    <span>{video.views || 0} views</span>
                                    <span>•</span>
                                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {expanded && channelVideos.length === 0 && (
                <div className="empty" style={{ padding: 40 }}>
                    <div className="empty-text">No videos published yet</div>
                </div>
            )}
        </div>
    );
}

export default function Channels({ channels, videos, onPlay, onToggleSubscribe, subscribedChannels, user }) {
    const [showCreateModal, setShowCreateModal] = React.useState(false);
    const [editingChannel, setEditingChannel] = React.useState(null);
    const [filter, setFilter] = React.useState('all');
    const [searchTerm, setSearchTerm] = React.useState('');

    async function handleDelete(channel) {
        if (!confirm(`Delete channel "${channel.name}"? This will NOT delete the videos, but they will become unlinked.`)) return;

        try {
            await deleteDoc(doc(db, 'channels', channel.id));
            alert('Channel deleted successfully');
        } catch (e) {
            alert('Error deleting channel: ' + e.message);
        }
    }

    const filteredChannels = channels
        .filter(ch => {
            const matchesSearch = ch.name.toLowerCase().includes(searchTerm.toLowerCase());
            if (filter === 'subscribed') return matchesSearch && subscribedChannels.includes(ch.id);
            if (filter === 'mine') return matchesSearch && ch.ownerId === user.uid;
            return matchesSearch;
        })
        .sort((a, b) => (b.subscribers || 0) - (a.subscribers || 0));

    const myChannels = channels.filter(ch => ch.ownerId === user.uid);
    const subscribedCount = channels.filter(ch => subscribedChannels.includes(ch.id)).length;

    return (
        <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                <div className="card" style={{ padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-gold)' }}>{channels.length}</div>
                    <div className="small">Total Channels</div>
                </div>
                <div className="card" style={{ padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-sage)' }}>{myChannels.length}</div>
                    <div className="small">My Channels</div>
                </div>
                <div className="card" style={{ padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-navy)' }}>{subscribedCount}</div>
                    <div className="small">Subscribed</div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Icons.Plus /> Create Channel
                </button>

                <input
                    type="text"
                    placeholder="Search channels..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ flex: 1, minWidth: 200, padding: '10px 16px', borderRadius: 4, border: '1px solid var(--border)', background: '#fff' }}
                />

                <div style={{ display: 'flex', gap: 8 }}>
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'subscribed', label: 'Subscribed' },
                        { id: 'mine', label: 'My Channels' }
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setFilter(opt.id)}
                            className={`btn ${filter === opt.id ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ padding: '8px 16px', fontSize: 12 }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Channels List */}
            {filteredChannels.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon"><Icons.Users /></div>
                    <div className="empty-title">No channels found</div>
                    <div className="empty-text">
                        {filter === 'mine'
                            ? 'Create your first channel to start publishing videos'
                            : 'Try adjusting your search or filters'}
                    </div>
                </div>
            ) : (
                filteredChannels.map(channel => (
                    <ChannelCard
                        key={channel.id}
                        channel={channel}
                        videos={videos}
                        onPlay={onPlay}
                        onToggleSubscribe={onToggleSubscribe}
                        isSubscribed={subscribedChannels.includes(channel.id)}
                        isOwner={channel.ownerId === user.uid}
                        onEdit={setEditingChannel}
                        onDelete={handleDelete}
                    />
                ))
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateChannelModal
                    onClose={() => setShowCreateModal(false)}
                    user={user}
                />
            )}

            {editingChannel && (
                <EditChannelModal
                    channel={editingChannel}
                    onClose={() => setEditingChannel(null)}
                />
            )}
        </div>
    );
}