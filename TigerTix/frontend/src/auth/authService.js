const API_URL = 'http://localhost:4000'; 

// Token handling 
function handleAuthError(res, data) {
  if (
    res.status === 401 &&
    ["token_expired", "missing token", "invalid_token"].includes(data?.error)
  ) {
    const path = window.location.pathname;

    // Don't redirect if logging in or registering
    const publicPaths = ["/login", "/register"];

    if (!publicPaths.includes(path)) {
      console.log("Session dead — redirecting to login from", path);
      window.location.href = "/login";
    } else {
      console.log("401 on public page, not redirecting");
    }

    return true;
  }

  return false;
}



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

  if (handleAuthError(res, data)) return null; // token expiration call 

  if (!res.ok || data.error) return null;

  return data.user;
}
