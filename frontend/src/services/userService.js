import api from './api';

// Fetch students and try to resolve a student id by name (case-insensitive contains)
export const findStudentByName = async (name) => {
  if (!name || !name.trim()) return null;
  const q = name.trim().toLowerCase();

  // try fetching students filtered by role first
  let res;
  try {
    res = await api.get('/users', { params: { role: 'student' } });
  } catch (e) {
    // fallback to unfiltered users
    try { res = await api.get('/users'); } catch (err) { return null; }
  }

  const usersRaw = res.data?.users || res.data || [];
  const users = Array.isArray(usersRaw) ? usersRaw : [];

  // exact match (case-insensitive)
  let match = users.find(u => (u.name || '').toLowerCase() === q);
  if (match) return match._id || match.id;

  // partial match: all words match in order
  match = users.find(u => {
    const nameLower = (u.name || '').toLowerCase();
    return q.split(' ').every(part => nameLower.includes(part));
  });
  if (match) return match._id || match.id;

  // email match fallback
  match = users.find(u => (u.email || '').toLowerCase().includes(q));
  if (match) return match._id || match.id;

  // no match
  return null;
};
