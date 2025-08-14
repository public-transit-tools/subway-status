import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Networks } from './pages/Networks'
import { TTC } from './pages/TTC'

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/networks', element: <Networks /> },
  { path: '/ttc', element: <TTC /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

