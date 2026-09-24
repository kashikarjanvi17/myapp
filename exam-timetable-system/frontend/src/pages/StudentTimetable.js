import React, { useEffect, useState } from 'react';
import { fetchMyTimetable } from '../api/api';
import { useAuth } from '../context/AuthContext';
import ExamList from '../components/ExamList';

export default function StudentTimetable() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    // Note: no year/section is sent from the client here — the backend
    // derives it entirely from the logged-in student's verified token,
    // so this view can never be tricked into showing another section's exams.
    (async () => {
      try {
        const { data } = await fetchMyTimetable();
        setExams(data.exams);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load timetable.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>My Exam Timetable</h1>
        <div>
          <span className="user-tag">
            {user?.name} — {user?.academicYear}, Section {user?.section}
          </span>
          <button className="btn btn-secondary" onClick={logout}>Log Out</button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <p>Loading timetable…</p> : <ExamList exams={exams} />}
    </div>
  );
}
