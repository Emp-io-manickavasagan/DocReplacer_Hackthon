import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/Landing'
import CoreAppFlow from './pages/CoreAppFlow'
import DocsPage from './pages/Docs'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<CoreAppFlow />} />
        <Route path="/docs" element={<DocsPage />} />
      </Routes>
    </Router>
  )
}
