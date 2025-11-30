import './assets/styles.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import store from './store'
import App from './App'
import RoomPage from './pages/RoomPage'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/room/:roomId', element: <RoomPage /> }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
)
