import { useState, useEffect } from 'react';
import { createIncident, getIncidents, updateIncident, Incident } from '../services/api';

type SortOrder = 'asc' | 'desc' | null;

interface IncidentListProps {
  user: string;
  onLogout: () => void;
}

const IncidentList = ({ user, onLogout }: IncidentListProps) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [editingIncidentId, setEditingIncidentId] = useState<string | null>(null);
  const [editSeverity, setEditSeverity] = useState<Incident['severity']>('LOW');
  const [editStatus, setEditStatus] = useState<Incident['status']>('OPEN');
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [newType, setNewType] = useState('');
  const [newSeverity, setNewSeverity] = useState<Incident['severity']>('LOW');
  const [newLatitude, setNewLatitude] = useState('');
  const [newLongitude, setNewLongitude] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const isAdmin = user === 'admin';

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

  const startEdit = (incident: Incident) => {
    setEditingIncidentId(incident.id);
    setEditSeverity(incident.severity);
    setEditStatus(incident.status);
    setUpdateError(null);
  };

  const cancelEdit = () => {
    setEditingIncidentId(null);
    setUpdateError(null);
  };

  const saveEdit = async (incidentId: string) => {
    setUpdateError(null);
    try {
      const updated = await updateIncident(incidentId, {
        severity: editSeverity,
        status: editStatus,
      });
      setIncidents((prev) => prev.map((incident) => (incident.id === incidentId ? updated : incident)));
      setEditingIncidentId(null);
    } catch (err) {
      setUpdateError('Failed to update incident. Please try again.');
      console.error(err);
    }
  };

  const handleCreateIncident = async () => {
    setCreateError(null);

    if (!newType.trim()) {
      setCreateError('Incident type is required.');
      return;
    }

    const latitude = Number(newLatitude);
    const longitude = Number(newLongitude);

    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      setCreateError('Latitude must be a number between -90 and 90.');
      return;
    }

    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      setCreateError('Longitude must be a number between -180 and 180.');
      return;
    }

    setCreating(true);
    try {
      const created = await createIncident({
        type: newType.trim(),
        severity: newSeverity,
        latitude,
        longitude,
        status: 'OPEN',
      });
      setIncidents((prev) => [created, ...prev]);
      setNewType('');
      setNewSeverity('LOW');
      setNewLatitude('');
      setNewLongitude('');
      setCreateError(null);
    } catch (err) {
      setCreateError('Failed to create incident. Please try again.');
      console.error(err);
    } finally {
      setCreating(false);
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
        <div>
          <p>Welcome <strong>{user}</strong>!</p>
        </div>
        <button onClick={onLogout}>Logout</button>
      </div>
      {isAdmin && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
          <h3>Add New Incident</h3>
          {createError && (
            <div style={{ color: 'red', marginBottom: '0.75rem' }}>
              {createError}
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
            <label>
              Type:
              <input
                type="text"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
            <label>
              Severity:
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as Incident['severity'])}
                style={{ marginLeft: '0.5rem' }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </label>
            <label>
              Latitude:
              <input
                type="number"
                value={newLatitude}
                onChange={(e) => setNewLatitude(e.target.value)}
                placeholder="-90 to 90"
                style={{ marginLeft: '0.5rem', width: '8rem' }}
              />
            </label>
            <label>
              Longitude:
              <input
                type="number"
                value={newLongitude}
                onChange={(e) => setNewLongitude(e.target.value)}
                placeholder="-180 to 180"
                style={{ marginLeft: '0.5rem', width: '8rem' }}
              />
            </label>
            <button type="button" onClick={handleCreateIncident} disabled={creating}>
              {creating ? 'Creating...' : 'Create Incident'}
            </button>
          </div>
        </div>
      )}
      {updateError && (
        <div style={{ color: 'red', marginTop: '0.75rem' }}>
          {updateError}
        </div>
      )}
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
            <th>Actions</th>
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
              <td>
                <a
                  href={`https://maps.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  View on Maps
                </a>
                {isAdmin && editingIncidentId !== incident.id && (
                  <button
                    type="button"
                    onClick={() => startEdit(incident)}
                    style={{ marginLeft: '8px' }}
                  >
                    Edit
                  </button>
                )}
                {isAdmin && editingIncidentId === incident.id && (
                  <span style={{ marginLeft: '8px' }}>
                    <select value={editSeverity} onChange={(e) => setEditSeverity(e.target.value as Incident['severity'])}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as Incident['status'])} style={{ marginLeft: '8px' }}>
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                    <button type="button" onClick={() => saveEdit(incident.id)} style={{ marginLeft: '8px' }}>
                      Save
                    </button>
                    <button type="button" onClick={cancelEdit} style={{ marginLeft: '4px' }}>
                      Cancel
                    </button>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncidentList;
