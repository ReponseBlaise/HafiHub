import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import UserProfile from './pages/UserProfile';
import EditProfile from './pages/EditProfile';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';

// Guard component to validate user profile ID
function UserProfileGuard() {
  const { id } = useParams();
  
  // Redirect to home if id is invalid
  if (!id || id === 'undefined' || isNaN(parseInt(id))) {
    return <Navigate to="/" replace />;
  }
  
  return <UserProfile />;
}

// Guard component to validate post ID
function PostDetailGuard() {
  const { id } = useParams();
  if (!id || id === 'undefined' || isNaN(parseInt(id))) {
    return <Navigate to="/" replace />;
  }
  return <PostDetail />;
}

// Guard component to validate post edit ID
function EditPostGuard() {
  const { id } = useParams();
  if (!id || id === 'undefined' || isNaN(parseInt(id))) {
    return <Navigate to="/" replace />;
  }
  return <EditPost />;
}

// Guard component to validate event ID
function EventDetailGuard() {
  const { id } = useParams();
  if (!id || id === 'undefined' || isNaN(parseInt(id))) {
    return <Navigate to="/events" replace />;
  }
  return <EventDetail />;
}

// Guard component to validate event edit ID
function EditEventGuard() {
  const { id } = useParams();
  if (!id || id === 'undefined' || isNaN(parseInt(id))) {
    return <Navigate to="/events" replace />;
  }
  return <EditEvent />;
}

// Guard component to validate news ID
function NewsDetailGuard() {
  const { id } = useParams();
  if (!id || id === 'undefined' || isNaN(parseInt(id))) {
    return <Navigate to="/news" replace />;
  }
  return <NewsDetail />;
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post/:id" element={<PostDetailGuard />} />
          <Route path="/post/:id/edit" element={<EditPostGuard />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/profile/:id" element={<UserProfileGuard />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/events" element={<Events />} />
          <Route path="/event/:id" element={<EventDetailGuard />} />
          <Route path="/event/:id/edit" element={<EditEventGuard />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetailGuard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
