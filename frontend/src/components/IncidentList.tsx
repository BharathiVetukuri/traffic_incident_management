import { useState, useEffect } from 'react';
import { getIncidents, Incident } from '../services/api';

type SortOrder = 'asc' | 'desc' | null;

interface IncidentListProps {
  onLogout: () => void;
  user: string;
}

const IncidentList: React.FC<IncidentListProps> = ({ onLogout, user }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await getIncidents(severityFilter || undefined, statusFilter || undefined);
      setIncidents(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch incidents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSortByPriority = () => {
    if (sortOrder === null) {
      setSortOrder('desc');
    } else if (sortOrder === 'desc') {
      setSortOrder('asc');
    } else {
      setSortOrder(null);
    }
  };

  const getSortedIncidents = () => {
    if (sortOrder === null) return incidents;
    
    const sorted = [...incidents].sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.priority_score - a.priority_score;
      } else {
        return a.priority_score - b.priority_score;
      }
    });
    return sorted;
  };

  useEffect(() => {
    fetchIncidents();
  }, [severityFilter, statusFilter]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Incidents</h2>
        <div>
          <span>Welcome, {user}!</span>
          <button onClick={onLogout} style={{ marginLeft: '10px' }}>Logout</button>
        </div>
      </div>
      <div>
        <label>
          Severity:
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="">All</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>
        <label>
          Status:
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </label>
        <button onClick={handleSortByPriority}>
          Sort by Priority {sortOrder === 'desc' ? '↓' : sortOrder === 'asc' ? '↑' : ''}
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Priority Score</th>
          </tr>
        </thead>
        <tbody>
          {getSortedIncidents().map((incident) => (
            <tr key={incident.id}>
              <td>{incident.id}</td>
              <td>{incident.type}</td>
              <td>{incident.severity}</td>
              <td>{incident.status}</td>
              <td>{incident.priority_score.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncidentList;
