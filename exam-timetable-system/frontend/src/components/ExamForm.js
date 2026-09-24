import React, { useState, useEffect } from 'react';

const EMPTY_FORM = {
  subject: '',
  academic_year: '',
  section: '',
  exam_date: '',
  start_time: '',
  end_time: '',
};

/**
 * Used for both "create exam" and "edit exam" — pass `initialData` to
 * pre-fill for editing, omit it for a blank create form.
 * Mirrors the backend's validation rules client-side for fast feedback,
 * but the backend is the authority (never trust client-side validation alone).
 */
export default function ExamForm({ initialData, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        subject: initialData.subject || '',
        academic_year: initialData.academic_year || '',
        section: initialData.section || '',
        exam_date: initialData.exam_date || '',
        start_time: (initialData.start_time || '').slice(0, 5),
        end_time: (initialData.end_time || '').slice(0, 5),
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.subject || !form.academic_year || !form.section || !form.exam_date || !form.start_time || !form.end_time) {
      setError('All fields are required.');
      return;
    }
    if (form.end_time <= form.start_time) {
      setError('End time must be strictly after start time.');
      return;
    }

    onSubmit(form);
  };

  return (
    <form className="exam-form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <label>
        Subject
        <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Data Structures" />
      </label>

      <label>
        Academic Year
        <input type="text" name="academic_year" value={form.academic_year} onChange={handleChange} placeholder="e.g. 2nd Year" />
      </label>

      <label>
        Section
        <input type="text" name="section" value={form.section} onChange={handleChange} placeholder="e.g. A" />
      </label>

      <label>
        Exam Date
        <input type="date" name="exam_date" value={form.exam_date} onChange={handleChange} />
      </label>

      <label>
        Start Time
        <input type="time" name="start_time" value={form.start_time} onChange={handleChange} />
      </label>

      <label>
        End Time
        <input type="time" name="end_time" value={form.end_time} onChange={handleChange} />
      </label>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">{submitLabel || 'Save'}</button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}
