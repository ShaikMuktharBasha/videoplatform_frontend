import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Upload from './pages/Upload';
import VideoPlayer from './pages/VideoPlayer';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/upload"
              element={
                <ProtectedRoute requireEditor={true}>
                  <Upload />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/video/:id"
              element={
                <ProtectedRoute>
                  <VideoPlayer />
                </ProtectedRoute>
              }
            />
            
            {/* Placeholders for new routes */}
            <Route
              path="/liked"
              element={
                <ProtectedRoute>
                  <Home />  {/* Reuse Home for now, will filter later */}
                </ProtectedRoute>
              }
            />
             <Route
              path="/disliked"
              element={
                <ProtectedRoute>
                  <Home /> {/* Placeholder */}
                </ProtectedRoute>
              }
            />
             <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <Home /> {/* Placeholder */}
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
