import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/Landing'
import CoreAppFlow from './pages/CoreAppFlow'

const BlogList = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))

export default function App() {
  return (
    <Router>
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#080810' }} />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<CoreAppFlow />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </Suspense>
    </Router>
  )
}
