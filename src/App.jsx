import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/Landing'
import CoreAppFlow from './pages/CoreAppFlow'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<CoreAppFlow />} />
      </Routes>
    </Router>
  )
}
