import React from 'react';
import { db } from '../firebase';
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    setDoc,
    onSnapshot,
    query,
    orderBy
} from 'firebase/firestore';

function UserManagementTab({ currentUser }) {
    const [users, setUsers] = React.useState([]);
    const [editingUser, setEditingUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            const userList = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            }));
            setUsers(userList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    async function handleRoleChange(uid, newRole) {
        try {
            await updateDoc(doc(db, 'users', uid), { role: newRole });
            alert('Role updated successfully');
        } catch (e) {
            alert('Error updating role: ' + e.message);
        }
    }

    async function handleToggleBan(uid, currentBanned) {
        try {
            await updateDoc(doc(db, 'users', uid), { banned: !currentBanned });
            alert(currentBanned ? 'User unbanned' : 'User banned');
        } catch (e) {
            alert('Error: ' + e.message);
        }
    }

    async function handleDeleteUser(uid, email) {
        if (!confirm(`Permanently delete user ${email}? This cannot be undone.`)) return;
        try {
            await deleteDoc(doc(db, 'users', uid));
            alert('User deleted');
        } catch (e) {
            alert('Error deleting user: ' + e.message);
        }
    }

    const canEditRoles = currentUser.role === 'super_admin' || currentUser.role === 'admin';
    const canDeleteUsers = currentUser.role === 'super_admin';

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 40 }}><div className="loading" /></div>;
    }

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h3 className="section-title" style={{ fontSize: 24, marginBottom: 8 }}>User Management</h3>
                <p className="small">Manage user roles and permissions</p>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--border)', padding: 24 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: 12, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Email</th>
                            <th style={{ padding: 12, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Display Name</th>
                            <th style={{ padding: 12, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Role</th>
                            <th style={{ padding: 12, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Status</th>
                            <th style={{ padding: 12, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.uid} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: 12, fontSize: 14 }}>{user.email || 'N/A'}</td>
                                <td style={{ padding: 12, fontSize: 14 }}>{user.displayName || 'Anonymous'}</td>
                                <td style={{ padding: 12 }}>
                                    {canEditRoles && user.uid !== currentUser.uid ? (
                                        <select
                                            value={user.role || 'user'}
                                            onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                                            style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 2, fontSize: 13, background: '#fff' }}
                                        >
                                            <option value="user">User</option>
                                            <option value="creator">Creator</option>
                                            <option value="moderator">Moderator</option>
                                            <option value="admin">Admin</option>
                                            {currentUser.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                                        </select>
                                    ) : (
                                        <span className="tag" style={{
                                            background: user.role === 'super_admin' ? '#c53030' : user.role === 'admin' ? '#d69e2e' : user.role === 'moderator' ? '#3182ce' : user.role === 'creator' ? '#38a169' : '#718096',
                                            color: '#fff',
                                            padding: '4px 10px',
                                            borderRadius: 12,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            textTransform: 'uppercase'
                                        }}>
                                            {user.role || 'user'}
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: 12 }}>
                                    <span style={{
                                        color: user.banned ? '#c53030' : '#38a169',
                                        fontWeight: 600,
                                        fontSize: 13
                                    }}>
                                        {user.banned ? 'Banned' : 'Active'}
                                    </span>
                                </td>
                                <td style={{ padding: 12 }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {canEditRoles && user.uid !== currentUser.uid && (
                                            <button
                                                className="btn btn-ghost"
                                                onClick={() => handleToggleBan(user.uid, user.banned)}
                                                style={{ padding: '6px 12px', fontSize: 12 }}
                                            >
                                                {user.banned ? 'Unban' : 'Ban'}
                                            </button>
                                        )}
                                        {canDeleteUsers && user.uid !== currentUser.uid && (
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleDeleteUser(user.uid, user.email)}
                                                style={{ padding: '6px 12px', fontSize: 12 }}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                        No users found
                    </div>
                )}
            </div>

            <div style={{ marginTop: 24, padding: 16, background: '#fffaf0', border: '1px solid #fbd38d', borderRadius: 2 }}>
                <strong style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#744210' }}>Role Permissions:</strong>
                <ul style={{ fontSize: 12, color: '#744210', lineHeight: 1.8, paddingLeft: 20 }}>
                    <li><strong>User:</strong> Can watch videos, comment, subscribe</li>
                    <li><strong>Creator:</strong> Can upload videos, manage own content</li>
                    <li><strong>Moderator:</strong> Can moderate comments, manage reports</li>
                    <li><strong>Admin:</strong> Can manage users, videos, and system settings</li>
                    <li><strong>Super Admin:</strong> Full system access, can manage admins</li>
                </ul>
            </div>
        </div>
    );
}

function VideoManagementTab({ currentUser }) {
    const [videos, setVideos] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState('all');

    React.useEffect(() => {
        const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const videoList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setVideos(videoList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    async function handleTogglePublish(videoId, currentPublished) {
        try {
            await updateDoc(doc(db, 'videos', videoId), {
                published: !currentPublished,
                publishedAt: !currentPublished ? new Date().toISOString() : null
            });
        } catch (e) {
            alert('Error: ' + e.message);
        }
    }

    async function handleDeleteVideo(videoId, title) {
        if (!confirm(`Delete video "${title}"? This cannot be undone.`)) return;
        try {
            await deleteDoc(doc(db, 'videos', videoId));
            alert('Video deleted');
        } catch (e) {
            alert('Error: ' + e.message);
        }
    }

    async function handleFeatureVideo(videoId, currentFeatured) {
        try {
            await updateDoc(doc(db, 'videos', videoId), {
                featured: !currentFeatured
            });
        } catch (e) {
            alert('Error: ' + e.message);
        }
    }

    const canManageVideos = ['super_admin', 'admin', 'moderator'].includes(currentUser.role);
    const canDeleteVideos = ['super_admin', 'admin'].includes(currentUser.role);

    const filteredVideos = videos.filter(v => {
        if (filter === 'published') return v.published;
        if (filter === 'draft') return !v.published;
        if (filter === 'featured') return v.featured;
        if (filter === 'reels') return v.type === 'reel';
        return true;
    });

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 40 }}><div className="loading" /></div>;
    }

    return (
        <div>
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 className="section-title" style={{ fontSize: 24, marginBottom: 8 }}>Video Management</h3>
                    <p className="small">Manage all platform videos</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilter('all')}
                        style={{ padding: '8px 16px', fontSize: 12 }}
                    >
                        All ({videos.length})
                    </button>
                    <button
                        className={`btn ${filter === 'published' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilter('published')}
                        style={{ padding: '8px 16px', fontSize: 12 }}
                    >
                        Published ({videos.filter(v => v.published).length})
                    </button>
                    <button
                        className={`btn ${filter === 'draft' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilter('draft')}
                        style={{ padding: '8px 16px', fontSize: 12 }}
                    >
                        Drafts ({videos.filter(v => !v.published).length})
                    </button>
                    <button
                        className={`btn ${filter === 'featured' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilter('featured')}
                        style={{ padding: '8px 16px', fontSize: 12 }}
                    >
                        Featured ({videos.filter(v => v.featured).length})
                    </button>
                    <button
                        className={`btn ${filter === 'reels' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilter('reels')}
                        style={{ padding: '8px 16px', fontSize: 12 }}
                    >
                        Reels ({videos.filter(v => v.type === 'reel').length})
                    </button>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {filteredVideos.map(video => (
                    <div key={video.id} className="card" style={{ position: 'relative' }}>
                        <div style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--charcoal)', overflow: 'hidden' }}>
                            <video src={video.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {video.featured && (
                                <div style={{ position: 'absolute', top: 8, left: 8, background: '#d4a574', color: '#000', padding: '4px 10px', borderRadius: 12, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                                    ⭐ Featured
                                </div>
                            )}
                            <div style={{ position: 'absolute', top: 8, right: 8, background: video.published ? '#38a169' : '#ecc94b', color: video.published ? '#fff' : '#000', padding: '4px 10px', borderRadius: 12, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                                {video.published ? 'Public' : 'Private'}
                            </div>
                        </div>

                        <div style={{ padding: 16 }}>
                            <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{video.title}</h4>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                                <div>By: {video.channelName}</div>
                                <div>{new Date(video.createdAt).toLocaleDateString()}</div>
                                {video.type === 'reel' && <span className="tag tag-reel" style={{ marginTop: 4, display: 'inline-block' }}>Reel</span>}
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 8,
                                marginBottom: 12,
                                padding: 12,
                                background: 'var(--off-white)',
                                borderRadius: 4,
                                fontSize: 11
                            }}>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Views</div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{video.views || 0}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Likes</div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{video.likes || 0}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Completions</div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{video.completions || 0}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Shares</div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{video.shares || 0}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {canManageVideos && (
                                    <>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleTogglePublish(video.id, video.published)}
                                            style={{ width: '100%', padding: '8px', fontSize: 12 }}
                                        >
                                            {video.published ? 'Unpublish' : 'Publish'}
                                        </button>
                                        <button
                                            className={`btn ${video.featured ? 'btn-primary' : 'btn-ghost'}`}
                                            onClick={() => handleFeatureVideo(video.id, video.featured)}
                                            style={{ width: '100%', padding: '8px', fontSize: 12 }}
                                        >
                                            {video.featured ? 'Unfeature' : 'Feature'}
                                        </button>
                                    </>
                                )}
                                {canDeleteVideos && (
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDeleteVideo(video.id, video.title)}
                                        style={{ width: '100%', padding: '8px', fontSize: 12 }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredVideos.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📹</div>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No videos found</div>
                    <div style={{ fontSize: 14 }}>Try changing the filter</div>
                </div>
            )}
        </div>
    );
}

function SystemSettingsTab({ currentUser }) {
    const [settings, setSettings] = React.useState({
        platformName: 'AiQMateTube',
        allowRegistration: true,
        requireEmailVerification: false,
        allowVideoUploads: true,
        maxVideoSize: 500,
        maintenanceMode: false,
        featuredVideosLimit: 10
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'system', 'settings'), (docSnap) => {
            if (docSnap.exists()) {
                setSettings({ ...settings, ...docSnap.data() });
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    async function handleSaveSettings() {
        try {
            await setDoc(doc(db, 'system', 'settings'), settings);
            alert('Settings saved successfully');
        } catch (e) {
            alert('Error saving settings: ' + e.message);
        }
    }

    const canManageSettings = ['super_admin', 'admin'].includes(currentUser.role);

    if (!canManageSettings) {
        return (
            <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Access Denied</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Only administrators can access system settings</div>
            </div>
        );
    }

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 40 }}><div className="loading" /></div>;
    }

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h3 className="section-title" style={{ fontSize: 24, marginBottom: 8 }}>System Settings</h3>
                <p className="small">Configure platform-wide settings</p>
            </div>

            <div style={{ maxWidth: 800 }}>
                <div className="card" style={{ padding: 32, marginBottom: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        <div className="input-group">
                            <label>Platform Name</label>
                            <input
                                type="text"
                                value={settings.platformName}
                                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                                style={{ fontSize: 16 }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'var(--off-white)', borderRadius: 2 }}>
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: 4 }}>Allow New Registrations</div>
                                <div className="small">Users can create new accounts</div>
                            </div>
                            <label style={{ position: 'relative', display: 'inline-block', width: 52, height: 28, margin: 0 }}>
                                <input
                                    type="checkbox"
                                    checked={settings.allowRegistration}
                                    onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{
                                    position: 'absolute',
                                    cursor: 'pointer',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: settings.allowRegistration ? '#48bb78' : '#cbd5e0',
                                    transition: '0.3s',
                                    borderRadius: 28,
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        content: '',
                                        height: 20,
                                        width: 20,
                                        left: settings.allowRegistration ? 28 : 4,
                                        bottom: 4,
                                        background: 'white',
                                        transition: '0.3s',
                                        borderRadius: '50%',
                                    }} />
                                </span>
                            </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'var(--off-white)', borderRadius: 2 }}>
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: 4 }}>Require Email Verification</div>
                                <div className="small">Users must verify email before uploading</div>
                            </div>
                            <label style={{ position: 'relative', display: 'inline-block', width: 52, height: 28, margin: 0 }}>
                                <input
                                    type="checkbox"
                                    checked={settings.requireEmailVerification}
                                    onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{
                                    position: 'absolute',
                                    cursor: 'pointer',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: settings.requireEmailVerification ? '#48bb78' : '#cbd5e0',
                                    transition: '0.3s',
                                    borderRadius: 28,
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        height: 20,
                                        width: 20,
                                        left: settings.requireEmailVerification ? 28 : 4,
                                        bottom: 4,
                                        background: 'white',
                                        transition: '0.3s',
                                        borderRadius: '50%',
                                    }} />
                                </span>
                            </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'var(--off-white)', borderRadius: 2 }}>
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: 4 }}>Allow Video Uploads</div>
                                <div className="small">Users can upload new videos</div>
                            </div>
                            <label style={{ position: 'relative', display: 'inline-block', width: 52, height: 28, margin: 0 }}>
                                <input
                                    type="checkbox"
                                    checked={settings.allowVideoUploads}
                                    onChange={(e) => setSettings({ ...settings, allowVideoUploads: e.target.checked })}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{
                                    position: 'absolute',
                                    cursor: 'pointer',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: settings.allowVideoUploads ? '#48bb78' : '#cbd5e0',
                                    transition: '0.3s',
                                    borderRadius: 28,
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        height: 20,
                                        width: 20,
                                        left: settings.allowVideoUploads ? 28 : 4,
                                        bottom: 4,
                                        background: 'white',
                                        transition: '0.3s',
                                        borderRadius: '50%',
                                    }} />
                                </span>
                            </label>
                        </div>

                        <div className="input-group">
                            <label>Max Video Size (MB)</label>
                            <input
                                type="number"
                                value={settings.maxVideoSize}
                                onChange={(e) => setSettings({ ...settings, maxVideoSize: parseInt(e.target.value) })}
                                min="10"
                                max="5000"
                                style={{ fontSize: 16 }}
                            />
                        </div>

                        <div className="input-group">
                            <label>Featured Videos Limit</label>
                            <input
                                type="number"
                                value={settings.featuredVideosLimit}
                                onChange={(e) => setSettings({ ...settings, featuredVideosLimit: parseInt(e.target.value) })}
                                min="5"
                                max="50"
                                style={{ fontSize: 16 }}
                            />
                        </div>

                        {currentUser.role === 'super_admin' && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 2 }}>
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: 4, color: '#c53030' }}>⚠️ Maintenance Mode</div>
                                    <div className="small" style={{ color: '#c53030' }}>Platform will be unavailable to regular users</div>
                                </div>
                                <label style={{ position: 'relative', display: 'inline-block', width: 52, height: 28, margin: 0 }}>
                                    <input
                                        type="checkbox"
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        cursor: 'pointer',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: settings.maintenanceMode ? '#f56565' : '#cbd5e0',
                                        transition: '0.3s',
                                        borderRadius: 28,
                                    }}>
                                        <span style={{
                                            position: 'absolute',
                                            height: 20,
                                            width: 20,
                                            left: settings.maintenanceMode ? 28 : 4,
                                            bottom: 4,
                                            background: 'white',
                                            transition: '0.3s',
                                            borderRadius: '50%',
                                        }} />
                                    </span>
                                </label>
                            </div>
                        )}

                        <button
                            className="btn btn-primary"
                            onClick={handleSaveSettings}
                            style={{ width: '100%', padding: 16 }}
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AnalyticsTab() {
    const [stats, setStats] = React.useState({
        totalUsers: 0,
        totalVideos: 0,
        totalViews: 0,
        publishedVideos: 0,
        draftVideos: 0,
        totalReels: 0,
        totalWatchTime: 0,
        totalCompletions: 0,
        totalLikes: 0,
        totalShares: 0,
        avgViewsPerVideo: 0,
        avgWatchTime: 0,
        completionRate: 0
    });
    const [topVideos, setTopVideos] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchStats() {
            try {
                const usersSnap = await getDocs(collection(db, 'users'));
                const videosSnap = await getDocs(collection(db, 'videos'));

                const videos = videosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
                const totalWatchTime = videos.reduce((sum, v) => sum + (v.watchTime || 0), 0);
                const totalCompletions = videos.reduce((sum, v) => sum + (v.completions || 0), 0);
                const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
                const totalShares = videos.reduce((sum, v) => sum + (v.shares || 0), 0);

                const sorted = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0));
                setTopVideos(sorted.slice(0, 10));

                setStats({
                    totalUsers: usersSnap.size,
                    totalVideos: videosSnap.size,
                    publishedVideos: videos.filter(v => v.published).length,
                    draftVideos: videos.filter(v => !v.published).length,
                    totalReels: videos.filter(v => v.type === 'reel').length,
                    totalViews,
                    totalWatchTime,
                    totalCompletions,
                    totalLikes,
                    totalShares,
                    avgViewsPerVideo: videos.length > 0 ? Math.round(totalViews / videos.length) : 0,
                    avgWatchTime: totalViews > 0 ? Math.round(totalWatchTime / totalViews) : 0,
                    completionRate: totalViews > 0 ? Math.round((totalCompletions / totalViews) * 100) : 0
                });
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        }
        fetchStats();
    }, []);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m ${seconds % 60}s`;
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num;
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 40 }}><div className="loading" /></div>;
    }

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h3 className="section-title" style={{ fontSize: 24, marginBottom: 8 }}>Platform Analytics</h3>
                <p className="small">Comprehensive overview of platform performance</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
                <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--accent-gold)', marginBottom: 8 }}>
                        {formatNumber(stats.totalViews)}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Views</div>
                </div>

                <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--accent-sage)', marginBottom: 8 }}>
                        {formatTime(stats.totalWatchTime)}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Watch Time</div>
                </div>

                <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 40, fontWeight: 800, color: '#48bb78', marginBottom: 8 }}>
                        {stats.totalVideos}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Videos</div>
                </div>

                <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--accent-navy)', marginBottom: 8 }}>
                        {stats.totalUsers}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</div>
                </div>

                <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 40, fontWeight: 800, color: '#e53e3e', marginBottom: 8 }}>
                        {formatNumber(stats.totalLikes)}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Likes</div>
                </div>

                <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 40, fontWeight: 800, color: '#805ad5', marginBottom: 8 }}>
                        {formatNumber(stats.totalShares)}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Shares</div>
                </div>

                <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 40, fontWeight: 800, color: '#d69e2e', marginBottom: 8 }}>
                        {stats.completionRate}%
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completion Rate</div>
                </div>

                <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 40, fontWeight: 800, color: '#319795', marginBottom: 8 }}>
                        {formatNumber(stats.totalCompletions)}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completions</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
                <div className="card" style={{ padding: 24 }}>
                    <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Content Distribution</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14 }}>Published Videos</span>
                            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-gold)' }}>{stats.publishedVideos}</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--warm-gray)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${stats.totalVideos > 0 ? (stats.publishedVideos / stats.totalVideos) * 100 : 0}%`,
                                background: 'var(--accent-gold)',
                                transition: 'width 0.3s'
                            }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                            <span style={{ fontSize: 14 }}>Draft Videos</span>
                            <span style={{ fontSize: 18, fontWeight: 700, color: '#ecc94b' }}>{stats.draftVideos}</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--warm-gray)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${stats.totalVideos > 0 ? (stats.draftVideos / stats.totalVideos) * 100 : 0}%`,
                                background: '#ecc94b',
                                transition: 'width 0.3s'
                            }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                            <span style={{ fontSize: 14 }}>Reels</span>
                            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-navy)' }}>{stats.totalReels}</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--warm-gray)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${stats.totalVideos > 0 ? (stats.totalReels / stats.totalVideos) * 100 : 0}%`,
                                background: 'var(--accent-navy)',
                                transition: 'width 0.3s'
                            }} />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: 24 }}>
                    <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Performance Metrics</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ padding: 12, background: 'var(--off-white)', borderRadius: 4 }}>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Avg Views per Video</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--charcoal)' }}>{stats.avgViewsPerVideo}</div>
                        </div>
                        <div style={{ padding: 12, background: 'var(--off-white)', borderRadius: 4 }}>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Avg Watch Time per View</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--charcoal)' }}>{formatTime(stats.avgWatchTime)}</div>
                        </div>
                        <div style={{ padding: 12, background: 'var(--off-white)', borderRadius: 4 }}>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Engagement Rate</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--charcoal)' }}>
                                {stats.totalViews > 0 ? Math.round(((stats.totalLikes + stats.totalShares) / stats.totalViews) * 100) : 0}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
                <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Top Performing Videos</h4>
                {topVideos.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                <th style={{ padding: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Title</th>
                                <th style={{ padding: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Type</th>
                                <th style={{ padding: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Views</th>
                                <th style={{ padding: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Likes</th>
                                <th style={{ padding: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Completion</th>
                                <th style={{ padding: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Shares</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topVideos.map((video, index) => (
                                <tr key={video.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: 12, fontSize: 14, maxWidth: 300 }}>
                                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{video.title}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>by {video.channelName}</div>
                                    </td>
                                    <td style={{ padding: 12 }}>
                                        <span className={`tag ${video.type === 'reel' ? 'tag-reel' : ''}`}>
                                            {video.type === 'reel' ? 'Reel' : 'Video'}
                                        </span>
                                    </td>
                                    <td style={{ padding: 12, fontSize: 14, fontWeight: 600 }}>{formatNumber(video.views || 0)}</td>
                                    <td style={{ padding: 12, fontSize: 14, fontWeight: 600 }}>{formatNumber(video.likes || 0)}</td>
                                    <td style={{ padding: 12, fontSize: 14, fontWeight: 600 }}>
                                        {video.views > 0 ? Math.round(((video.completions || 0) / video.views) * 100) : 0}%
                                    </td>
                                    <td style={{ padding: 12, fontSize: 14, fontWeight: 600 }}>{formatNumber(video.shares || 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                        No videos yet
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Admin({ user }) {
    const [activeTab, setActiveTab] = React.useState('analytics');
    const [currentUserData, setCurrentUserData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!user) return;

        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
            if (docSnap.exists()) {
                setCurrentUserData({ uid: user.uid, ...docSnap.data() });
            } else {
                setCurrentUserData({ uid: user.uid, role: 'user' });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <div style={{ display: 'grid', placeItems: 'center', height: 'calc(100vh - 120px)' }}>
                <div className="loading" />
            </div>
        );
    }

    const userRole = currentUserData?.role || 'user';
    const hasAccess = ['super_admin', 'admin', 'moderator'].includes(userRole);

    if (!hasAccess) {
        return (
            <div style={{ display: 'grid', placeItems: 'center', height: 'calc(100vh - 120px)', textAlign: 'center' }}>
                <div>
                    <div style={{ fontSize: 80, marginBottom: 24 }}>🔒</div>
                    <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, fontFamily: 'Playfair Display, serif' }}>
                        Access Denied
                    </h2>
                    <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 24 }}>
                        You do not have permission to access the admin panel.
                    </p>
                    <p className="small" style={{ color: 'var(--text-secondary)' }}>
                        Your current role: <strong>{userRole}</strong>
                    </p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'analytics', label: 'Analytics', icon: '📊', allowedRoles: ['super_admin', 'admin', 'moderator'] },
        { id: 'users', label: 'Users', icon: '👥', allowedRoles: ['super_admin', 'admin', 'moderator'] },
        { id: 'videos', label: 'Videos', icon: '🎬', allowedRoles: ['super_admin', 'admin', 'moderator'] },
        { id: 'settings', label: 'Settings', icon: '⚙️', allowedRoles: ['super_admin', 'admin'] }
    ];

    const visibleTabs = tabs.filter(tab => tab.allowedRoles.includes(userRole));

    return (
        <div>
            <div style={{
                background: 'linear-gradient(135deg, var(--charcoal) 0%, var(--deep-black) 100%)',
                padding: '32px 0',
                marginBottom: 40,
                borderBottom: '3px solid var(--accent-gold)'
            }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                        <div style={{ fontSize: 40 }}>🛡️</div>
                        <div>
                            <h2 style={{
                                fontSize: 36,
                                fontWeight: 800,
                                color: '#fff',
                                marginBottom: 4,
                                fontFamily: 'Playfair Display, serif',
                                letterSpacing: '-0.02em'
                            }}>
                                Admin Dashboard
                            </h2>
                            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                {user.displayName || user.email} • {userRole.replace('_', ' ').toUpperCase()}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {visibleTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '12px 24px',
                                    background: activeTab === tab.id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
                                    color: activeTab === tab.id ? 'var(--charcoal)' : '#fff',
                                    border: 'none',
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px 64px' }}>
                {activeTab === 'analytics' && <AnalyticsTab />}
                {activeTab === 'users' && <UserManagementTab currentUser={currentUserData} />}
                {activeTab === 'videos' && <VideoManagementTab currentUser={currentUserData} />}
                {activeTab === 'settings' && <SystemSettingsTab currentUser={currentUserData} />}
            </div>
        </div>
    );
}