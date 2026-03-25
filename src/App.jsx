import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';


import "./App.css"
import Events from './components/Events';
import PerEvent from './components/PerEvent';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';
import Chat from './components/Chat';
import ChatBot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import MyFavouriteEvents from './features/events/pages/MyFavouriteEvents';
import MyBookedEvents from './features/events/pages/MyBookedEvents';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/event/:id" element={<PerEvent />} />
          <Route path="/chatbot" element={<ChatBot />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-favourites"
              element={
                <ProtectedRoute>
                  <MyFavouriteEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookedEvents />
                </ProtectedRoute>
              }
            />

            
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/signup" element={<Signup />} />
          
        </Routes>
      </Router>
    </>
  );
}

export default App;