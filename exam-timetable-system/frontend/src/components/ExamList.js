import React from 'react';

/**
 * Renders a table of exams. `actions` (optional) lets the caller inject
 * admin-only buttons (edit/cancel/delete) per row; the student timetable
 * view renders this same component without actions.
 */
export default function ExamList({ exams, actions }) {
  if (!exams || exams.length === 0) {
    return <p className="empty-state">No exams found.</p>;
  }

  return (
    <table className="exam-table">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Year</th>
          <th>Section</th>
          <th>Date</th>
          <th>Start</th>
          <th>End</th>
          <th>Status</th>
          {actions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {exams.map((exam) => (
          <tr key={exam.id} className={exam.status === 'CANCELLED' ? 'row-cancelled' : ''}>
            <td>{exam.subject}</td>
            <td>{exam.academic_year}</td>
            <td>{exam.section}</td>
            <td>{exam.exam_date}</td>
            <td>{(exam.start_time || '').slice(0, 5)}</td>
            <td>{(exam.end_time || '').slice(0, 5)}</td>
            <td>
              <span className={`badge ${exam.status === 'CANCELLED' ? 'badge-cancelled' : 'badge-scheduled'}`}>
                {exam.status}
              </span>
            </td>
            {actions && <td>{actions(exam)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
