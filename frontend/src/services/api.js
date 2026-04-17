/**
 * API Service - Centralized backend communication
 * All requests go through this service for consistency
 */

const API_BASE_URL = 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  /**
   * Get stored JWT token
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Set JWT token and save to localStorage
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  /**
   * Make authenticated request with JWT token
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add token if available
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'API error');
    }

    return response.json();
  }

  /**
   * GET request
   */
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ===== AUTHENTICATION =====

  /**
   * Register new user
   */
  register(email, name, password) {
    return this.post('/auth/register', { email, name, password });
  }

  /**
   * Login user
   */
  login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  /**
   * Logout (clear token)
   */
  logout() {
    this.setToken(null);
  }

  // ===== POSTS =====

  /**
   * Get all posts
   */
  getPosts(page = 1, limit = 20) {
    return this.get(`/posts?page=${page}&limit=${limit}`);
  }

  /**
   * Get single post
   */
  getPost(id) {
    return this.get(`/posts/${id}`);
  }

  /**
   * Search posts
   */
  searchPosts(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.location) params.append('location', filters.location);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    return this.get(`/posts/search?${params.toString()}`);
  }

  /**
   * Create post
   */
  createPost(title, description, category, location) {
    return this.post('/posts', {
      title,
      description,
      category,
      location,
    });
  }

  /**
   * Update post
   */
  updatePost(postId, data) {
    return this.put(`/posts/${postId}`, data);
  }

  /**
   * Delete post
   */
  deletePost(postId) {
    return this.delete(`/posts/${postId}`);
  }

  // ===== COMMENTS =====

  /**
   * Get comments for a post
   */
  getComments(postId, page = 1, limit = 20) {
    return this.get(`/comments/${postId}?page=${page}&limit=${limit}`);
  }

  /**
   * Create comment
   */
  createComment(postId, content) {
    return this.post('/comments', { postId, content });
  }

  /**
   * Delete comment
   */
  deleteComment(commentId) {
    return this.delete(`/comments/${commentId}`);
  }

  // ===== LIKES =====

  /**
   * Toggle like on post
   */
  toggleLike(postId) {
    return this.post('/likes', { postId });
  }

  /**
   * Get like count for post
   */
  getLikeCount(postId) {
    return this.get(`/likes/${postId}`);
  }

  // ===== USERS =====

  /**
   * Get user profile
   */
  getUserProfile(userId) {
    return this.get(`/users/${userId}`);
  }

  /**
   * Search users
   */
  searchUsers(query, page = 1, limit = 20) {
    return this.get(
      `/users/search?query=${query}&page=${page}&limit=${limit}`
    );
  }

  // ===== EVENTS =====

  /**
   * Get all events
   */
  getEvents(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (filters.category) params.append('category', filters.category);
    if (filters.location) params.append('location', filters.location);
    
    return this.get(`/events?${params.toString()}`);
  }

  /**
   * Get single event
   */
  getEvent(id) {
    return this.get(`/events/${id}`);
  }

  /**
   * Create event
   */
  createEvent(eventData) {
    return this.post('/events', eventData);
  }

  /**
   * Update event
   */
  updateEvent(id, eventData) {
    return this.put(`/events/${id}`, eventData);
  }

  /**
   * Delete event
   */
  deleteEvent(id) {
    return this.delete(`/events/${id}`);
  }

  // ===== BOOKINGS =====

  /**
   * Get user's bookings
   */
  getBookings() {
    return this.get('/bookings');
  }

  /**
   * Book an event
   */
  bookEvent(eventId) {
    return this.post('/bookings', { eventId });
  }

  /**
   * Cancel booking
   */
  cancelBooking(bookingId) {
    return this.delete(`/bookings/${bookingId}`);
  }

  // ===== NEWS =====

  /**
   * Get news
   */
  getNews(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (filters.category) params.append('category', filters.category);
    if (filters.featured) params.append('featured', filters.featured);
    
    return this.get(`/news?${params.toString()}`);
  }

  /**
   * Get single news article
   */
  getNewsArticle(id) {
    return this.get(`/news/${id}`);
  }

  /**
   * Create news (admin)
   */
  createNews(newsData) {
    return this.post('/news', newsData);
  }

  /**
   * Update news (admin)
   */
  updateNews(id, newsData) {
    return this.put(`/news/${id}`, newsData);
  }

  /**
   * Delete news (admin)
   */
  deleteNews(id) {
    return this.delete(`/news/${id}`);
  }
}

// Create singleton instance
export const api = new ApiService();
export default ApiService;
