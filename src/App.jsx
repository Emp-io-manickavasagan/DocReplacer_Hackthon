import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/Landing'
import CoreAppFlow from './pages/CoreAppFlow'
import DocsPage from './pages/Docs'
import EnginePage from './pages/Engine'
import UseCasePage from './pages/UseCase'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<CoreAppFlow />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/engine" element={<EnginePage />} />
        <Route path="/use-cases" element={<UseCasePage />} />
      </Routes>
    </Router>
  )
}
