import React, { useState, useEffect } from 'react';

function App() {
  const [briefingData, setBriefingData] = useState({
    calendar: [],
    tasks: [],
    notes: [],
    emails: []
  });
  const [loading, setLoading] = useState(false);
  const [todoistToken, setTodoistToken] = useState(localStorage.getItem('todoistToken') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const data = { calendar: [], tasks: [], notes: [], emails: [] };
      
      // Fetch Todoist tasks
      if (todoistToken) {
        const todoistRes = await fetch('https://api.todoist.com/rest/v2/tasks', {
          headers: { 'Authorization': `Bearer ${todoistToken}` }
        });
        if (todoistRes.ok) {
          const tasks = await todoistRes.json();
          data.tasks = tasks.filter(t => !t.completed).slice(0, 10);
        }
      }
      
      // Mock data for calendar (placeholder - would use MCP in production)
      data.calendar = [
        { time: '9:00 AM', title: 'Team Standup', description: 'Daily sync with team' },
        { time: '2:00 PM', title: 'Client Call', description: 'Q1 Planning discussion' }
      ];
      
      // Mock notes data
      data.notes = [
        { title: 'Project Ideas', preview: 'Review morning briefing implementation...' },
        { title: 'Meeting Notes', preview: 'Follow up on action items from yesterday...' }
      ];
      
      setBriefingData(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching briefing:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [todoistToken]);

  const saveTodoistToken = () => {
    localStorage.setItem('todoistToken', todoistToken);
    setShowSettings(false);
    fetchBriefing();
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>☀️ Morning Briefing</h1>
        <div style={styles.headerActions}>
          {lastRefresh && (
            <span style={styles.lastRefresh}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={fetchBriefing} 
            disabled={loading}
            style={styles.refreshBtn}
          >
            {loading ? '⏳' : '🔄'} Refresh
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            style={styles.settingsBtn}
          >
            ⚙️
          </button>
        </div>
      </header>

      {showSettings && (
        <div style={styles.settingsPanel}>
          <h3>Settings</h3>
          <div style={styles.settingGroup}>
            <label style={styles.label}>Todoist API Token:</label>
            <input
              type="password"
              value={todoistToken}
              onChange={(e) => setTodoistToken(e.target.value)}
              placeholder="Paste your Todoist API token"
              style={styles.input}
            />
            <button onClick={saveTodoistToken} style={styles.saveBtn}>
              Save
            </button>
            <p style={styles.helpText}>
              Get your token from:{' '}
              <a 
                href="https://todoist.com/app/settings/integrations" 
                target="_blank" 
                rel="noopener noreferrer"
                style={styles.link}
              >
                Todoist Settings → Integrations
              </a>
            </p>
          </div>
        </div>
      )}

      <main style={styles.main}>
        <div style={styles.grid}>
          {/* Calendar Section */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>📅 Today's Schedule</h2>
            {briefingData.calendar.length > 0 ? (
              <div style={styles.list}>
                {briefingData.calendar.map((event, i) => (
                  <div key={i} style={styles.listItem}>
                    <span style={styles.time}>{event.time}</span>
                    <div>
                      <div style={styles.eventTitle}>{event.title}</div>
                      <div style={styles.eventDesc}>{event.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.emptyState}>No events scheduled for today</p>
            )}
          </section>

          {/* Tasks Section */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>✅ Today's Tasks</h2>
            {briefingData.tasks.length > 0 ? (
              <div style={styles.list}>
                {briefingData.tasks.map((task, i) => (
                  <div key={i} style={styles.listItem}>
                    <input type="checkbox" style={styles.checkbox} />
                    <span>{task.content}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.emptyState}>
                {todoistToken 
                  ? 'No tasks for today! 🎉' 
                  : 'Connect Todoist to see your tasks'}
              </p>
            )}
          </section>

          {/* Notes Section */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>📝 Recent Notes</h2>
            {briefingData.notes.length > 0 ? (
              <div style={styles.list}>
                {briefingData.notes.map((note, i) => (
                  <div key={i} style={styles.noteItem}>
                    <div style={styles.noteTitle}>{note.title}</div>
                    <div style={styles.notePreview}>{note.preview}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.emptyState}>No recent notes</p>
            )}
          </section>

          {/* Email Section */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>📧 Email Summary</h2>
            <p style={styles.emptyState}>Email integration coming soon</p>
          </section>
        </div>
      </main>

      <footer style={styles.footer}>
        <p>Deployed with ❤️ on Vercel</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    backgroundColor: 'white',
    padding: '20px 40px',
    borderBottom: '1px solid #e5e5ea',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '600'
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  lastRefresh: {
    fontSize: '14px',
    color: '#666'
  },
  refreshBtn: {
    padding: '8px 16px',
    backgroundColor: '#007aff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  settingsBtn: {
    padding: '8px 16px',
    backgroundColor: '#f5f5f7',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px'
  },
  settingsPanel: {
    backgroundColor: '#fff9e6',
    padding: '20px 40px',
    borderBottom: '1px solid #e5e5ea'
  },
  settingGroup: {
    marginTop: '12px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    maxWidth: '400px',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    marginBottom: '8px'
  },
  saveBtn: {
    padding: '8px 20px',
    backgroundColor: '#34c759',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    marginLeft: '8px'
  },
  helpText: {
    fontSize: '12px',
    color: '#666',
    marginTop: '8px'
  },
  link: {
    color: '#007aff'
  },
  main: {
    padding: '40px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  cardTitle: {
    margin: '0 0 16px 0',
    fontSize: '20px',
    fontWeight: '600'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  listItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px'
  },
  time: {
    fontWeight: '600',
    color: '#007aff',
    minWidth: '70px'
  },
  eventTitle: {
    fontWeight: '500',
    marginBottom: '4px'
  },
  eventDesc: {
    fontSize: '14px',
    color: '#666'
  },
  checkbox: {
    marginTop: '2px',
    cursor: 'pointer'
  },
  noteItem: {
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px'
  },
  noteTitle: {
    fontWeight: '500',
    marginBottom: '4px'
  },
  notePreview: {
    fontSize: '14px',
    color: '#666'
  },
  emptyState: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '20px'
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
    fontSize: '14px'
  }
};

export default App;
