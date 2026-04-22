import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import '../styles/home.css';

export default function Home() {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const categories = [
    { id: 'all', label: 'All Posts', icon: '📋' },
    { id: 'job', label: 'Jobs', icon: '💼' },
    { id: 'quick_job', label: 'Quick Jobs', icon: '⚡' },
    { id: 'service', label: 'Services', icon: '🔧' },
    { id: 'product', label: 'Products', icon: '📦' },
    { id: 'business', label: 'Business', icon: '🏢' }
  ];

  useEffect(() => {
    const categoryParam = searchParams.get('category') || 'all';
    setSelectedCategory(categoryParam);
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await api.getPosts(1, 100);
      setAllPosts(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load posts: ' + err.message);
      setAllPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchParams({ category: categoryId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getFilteredPosts = () => {
    if (selectedCategory === 'all') {
      return allPosts;
    }
    return allPosts.filter(post => post.category === selectedCategory);
  };

  const filteredPosts = getFilteredPosts();

  const getCategoryPosts = (category) => {
    return allPosts.filter(post => post.category === category);
  };

  const groupedCategories = {
    jobs: allPosts.filter(p => p.category === 'job' || p.category === 'quick_job'),
    services: allPosts.filter(p => p.category === 'service'),
    products: allPosts.filter(p => p.category === 'product'),
    business: allPosts.filter(p => p.category === 'business')
  };

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/create-post');
  };

  const renderCategorySection = (label, icon, posts, categoryId) => {
    if (posts.length === 0) return null;
    
    return (
      <div key={categoryId} className="category-section">
        <div className="category-header">
          <h2>{icon} {label}</h2>
          <button 
            className="view-all-btn"
            onClick={() => handleCategoryChange(categoryId)}
          >
            View All ({posts.length}) →
          </button>
        </div>
        <div className="posts-list">
          {posts.slice(0, 3).map((post) => (
            <PostCard key={post.id} post={post} onPostUpdated={loadPosts} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Feed</h1>
      </div>

      {!isAuthenticated && (
        <div className="welcome-banner">
          <h2>Welcome to HafiHub</h2>
          <p>A local economic activity marketplace for Rwanda. Connect, trade, and grow together.</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Login to Get Started
          </button>
        </div>
      )}

      {/* Category Filter Menu */}
      <div className="category-filter-menu">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            <span className="filter-icon">{cat.icon}</span>
            <span className="filter-label">{cat.label}</span>
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="posts-container">
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : selectedCategory === 'all' ? (
          // Home view with category sections
          <>
            {allPosts.length === 0 ? (
              <div className="empty-state">
                <p>No posts yet. Be the first to create one!</p>
                {isAuthenticated && (
                  <button className="btn-primary" onClick={handleCreatePost}>
                    Create First Post
                  </button>
                )}
              </div>
            ) : (
              <div className="categories-view">
                {renderCategorySection('💼 Jobs & Opportunities', '💼', groupedCategories.jobs, 'job')}
                {renderCategorySection('🔧 Services', '🔧', groupedCategories.services, 'service')}
                {renderCategorySection('📦 Products', '📦', groupedCategories.products, 'product')}
                {renderCategorySection('🏢 Business', '🏢', groupedCategories.business, 'business')}
              </div>
            )}
          </>
        ) : (
          // Category view with all items
          <>
            {filteredPosts.length > 0 ? (
              <div className="posts-list">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} onPostUpdated={loadPosts} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No posts in this category yet.</p>
                {isAuthenticated && (
                  <button className="btn-primary" onClick={handleCreatePost}>
                    Create First Post
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
