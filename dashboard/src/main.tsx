import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Splash } from './components/Splash'
import { loadData } from './lib/loadData'
import { setData } from './data'
import { initModel } from './lib/model'

// Fetch the live data from Supabase, install it, then render. Views read the data
// synchronously at render, so we resolve it before the first render rather than
// threading loading state through every component.

const root = createRoot(document.getElementById('root')!)
root.render(<Splash label="Loading competitive intel…" />)

loadData()
  .then((data) => {
    setData(data)
    initModel(data)
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
  .catch((err: unknown) => {
    console.error('Failed to load dashboard data', err)
    root.render(
      <Splash
        label="Couldn't load the dashboard data."
        detail={err instanceof Error ? err.message : String(err)}
        error
      />,
    )
  })
