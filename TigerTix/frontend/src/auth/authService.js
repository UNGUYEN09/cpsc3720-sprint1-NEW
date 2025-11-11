const API_URL = 'http://localhost:4000'; 

// --------------------- REGISTER ---------------------
export async function registerUser(email, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // important for cookies
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  return data; // { message: 'registered', userId: ... }
}

// --------------------- LOGIN ---------------------
export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // important for HTTP-only cookie
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }

  // data: { message: 'logged in', user: { id, email } }
  return data;
}

// --------------------- LOGOUT ---------------------
export async function logoutUser() {
  const res = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return res.ok;
}

// --------------------- FETCH CURRENT USER ---------------------
export async function fetchProfile() {
  const res = await fetch(`${API_URL}/profile`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok || data.error) return null;

  return data.user; // { id, email, created_at }
}
