import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Registration from "./pages/Registration";
import PageNotFound from "./pages/PageNotFound";
import {AuthProvider } from './helpers/AuthContext'
import Dashboard from './pages/Dashboard';
import Annoucement from './pages/Annoucement';
import AnnouncementDetail from './pages/AnnouncementDetail';

function App() {

  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Navbar />
          <div className="container flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registration" element={<Registration />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/annoucement" element={<Annoucement />} />
              <Route path="/annoucement/:id" element={<AnnouncementDetail />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </div>
          <Footer />
        </Router>
        
      </AuthProvider>
    </div>
  );
}

export default App;