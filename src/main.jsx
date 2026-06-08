import React from 'react'
import { createRoot } from 'react-dom/client'
import SmokingSurvey from './App.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SmokingSurvey />
  </React.StrictMode>,
)
