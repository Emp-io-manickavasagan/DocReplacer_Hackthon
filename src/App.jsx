import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/Landing'
import CoreAppFlow from './pages/CoreAppFlow'
import DocsPage from './pages/Docs'
//import EnginePage from './pages/Engine'
import UseCasePage from './pages/UseCase'
import HowItWorksPage from './pages/HowItWorks'
import BlogPage from './pages/Blog'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<CoreAppFlow />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/use-cases" element={<UseCasePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/admin-portal-x9z2p4" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}
