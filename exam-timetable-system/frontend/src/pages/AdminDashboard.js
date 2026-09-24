import React, { useEffect, useState } from 'react';
import { fetchAllExams, createExam, updateExam, cancelExam, deleteExam } from '../api/api';
import { useAuth } from '../context/AuthContext';
import ExamForm from '../components/ExamForm';
import ExamList from '../components/ExamList';

export default function AdminDashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null); // null = creating new
  const { user, logout } = useAuth();

  const loadExams = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchAllExams();
      setExams(data.exams);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load exams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingExam) {
        await updateExam(editingExam.id, formData);
      } else {
        await createExam(formData);
      }
      setShowForm(false);
      setEditingExam(null);
      loadExams();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed.');
    }
  };

  const handleCancel = async (exam) => {
    if (!window.confirm(`Cancel the exam "${exam.subject}"?`)) return;
    try {
      await cancelExam(exam.id);
      loadExams();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed.');
    }
  };

  const handleDelete = async (exam) => {
    if (!window.confirm(`Permanently delete "${exam.subject}"? This cannot be undone.`)) return;
    try {
      await deleteExam(exam.id);
      loadExams();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div>
          <span className="user-tag">Logged in as {user?.username}</span>
          <button className="btn btn-secondary" onClick={logout}>Log Out</button>
        </div>
      </header>

      <div className="dashboard-actions">
        <button
          className="btn btn-primary"
          onClick={() => { setEditingExam(null); setShowForm(true); }}
        >
          + New Exam
        </button>
      </div>

      {showForm && (
        <div className="form-panel">
          <h2>{editingExam ? 'Edit Exam' : 'Create Exam'}</h2>
          <ExamForm
            initialData={editingExam}
            submitLabel={editingExam ? 'Update Exam' : 'Create Exam'}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => { setShowForm(false); setEditingExam(null); }}
          />
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p>Loading exams…</p>
      ) : (
        <ExamList
          exams={exams}
          actions={(exam) => (
            <div className="row-actions">
              <button
                className="btn btn-small"
                onClick={() => { setEditingExam(exam); setShowForm(true); }}
              >
                Edit
              </button>
              {exam.status !== 'CANCELLED' && (
                <button className="btn btn-small btn-warning" onClick={() => handleCancel(exam)}>
                  Cancel
                </button>
              )}
              <button className="btn btn-small btn-danger" onClick={() => handleDelete(exam)}>
                Delete
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}
