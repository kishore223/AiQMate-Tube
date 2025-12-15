import React from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function StatCard({ icon, label, value, color = '#d4a574' }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 4, background: color + '22', border: `1px solid ${color}33`, display: 'grid', placeItems: 'center', color: color }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', color: color }}>{value}</div>
          <div className="small">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function Profile({ videos, subscriptions, user }) {
  const [historyCount, setHistoryCount] = React.useState(0);

  React.useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      // Fetch history for THIS specific user
      const snap = await getDocs(collection(db, 'users', user.uid, 'history'));
      setHistoryCount(snap.size);
    }
    fetchStats();
  }, [user]);

  // Filter videos created by THIS user
  const myVideos = videos.filter(v => v.creatorId === user?.uid || v.channelName === user?.displayName);

  const stats = {
    totalVideos: myVideos.length,
    reels: myVideos.filter(v => v.type === 'reel').length,
    watched: historyCount,
    subscriptions: subscriptions.length
  };

  return (
    <div>
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#1a1816', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 32, fontWeight: 700 }}>
          {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
        </div>
        <div>
          <h2 className="section-title" style={{ fontSize: 32, marginBottom: 4 }}>{user.displayName || 'Creator'}</h2>
          <div className="small">{user.email}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
        <StatCard icon={<span>V</span>} label="My Videos" value={stats.totalVideos} />
        <StatCard icon={<span>R</span>} label="My Reels" value={stats.reels} />
        <StatCard icon={<span>H</span>} label="Watched" value={stats.watched} />
        <StatCard icon={<span>S</span>} label="Subscriptions" value={stats.subscriptions} />
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 className="section-title" style={{ fontSize: 20, marginBottom: 16 }}>Account Status</h2>
        <div className="card" style={{ padding: 24 }}>
          <p><strong>Cloud Sync Active</strong></p>
          <p className="small">Logged in as {user.email}</p>
        </div>
      </div>
    </div>
  );
}