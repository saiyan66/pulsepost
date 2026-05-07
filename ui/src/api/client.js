const BASE = '';  


async function request(method, path, body = null, requiresAuth = true) {
  const headers = { 'Content-Type': 'application/json' };

  if (requiresAuth) {
    const token = localStorage.getItem('pp_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });


  if (res.status === 204) return null;
  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : JSON.stringify(data.detail)
    );
  }

  return data;
}

export const authApi = {
  register: (username, email, password) =>
    request('POST', '/api/auth/register', { username, email, password }, false),

  login: (email, password) =>
    request('POST', '/api/auth/login', { email, password }, false),

  me: () =>
    request('GET', '/api/auth/me'),

  refresh: (refresh_token) =>
    request('POST', '/api/auth/refresh', { refresh_token }),
};

 
export const postsApi = {
  list: (limit = 10, cursor = null) => {
    const params = new URLSearchParams({ limit });
    if (cursor) params.set('cursor', cursor);
    return request('GET', `/api/posts?${params}`, null, false);
  },

  feed: (limit = 10, cursor = null) => {
    const params = new URLSearchParams({ limit });
    if (cursor) params.set('cursor', cursor);
    return request('GET', `/api/posts/feed?${params}`);
  },

  get: (id) =>
    request('GET', `/api/posts/${id}`, null, false),

  create: (title, content) =>
    request('POST', '/api/posts', { title, content }),

  update: (id, data) =>
    request('PUT', `/api/posts/${id}`, data),

  delete: (id) =>
    request('DELETE', `/api/posts/${id}`),

  search: (q) =>
  request('GET', `/api/posts/search?q=${encodeURIComponent(q)}`, null, false),

};


export const commentsApi = {
  list: (postId) =>
    request('GET', `/api/posts/${postId}/comments`, null, false),

  create: (postId, content) =>
    request('POST', `/api/posts/${postId}/comments`, { content }),

  delete: (postId, commentId) =>
    request('DELETE', `/api/posts/${postId}/comments/${commentId}`),
};


export const usersApi = {
  get: (id) =>
    request('GET', `/api/users/${id}`, null, false),

  follow: (id) =>
    request('POST', `/api/users/${id}/follow`),

  unfollow: (id) =>
    request('DELETE', `/api/users/${id}/follow`),

  followers: (id) =>
    request('GET', `/api/users/${id}/followers`, null, false),

  following: (id) =>
    request('GET', `/api/users/${id}/following`, null, false),

  search: (q) =>
  request('GET', `/api/users/search?q=${encodeURIComponent(q)}`, null, false),

};