import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Shell from './components/layout/Shell'
import Overview from './pages/Overview'
import MapExplorer from './pages/MapExplorer'
import Trends from './pages/Trends'
import Analytics from './pages/Analytics'
import Regions from './pages/Regions'
import Districts from './pages/Districts'
import Compare from './pages/Compare'
import Docs from './pages/Docs'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Overview />} />
          <Route path="map" element={<MapExplorer />} />
          <Route path="trends" element={<Trends />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="regions" element={<Regions />} />
          <Route path="regions/:region" element={<Regions />} />
          <Route path="regions/:region/:district" element={<Regions />} />
          <Route path="districts" element={<Districts />} />
          <Route path="compare" element={<Compare />} />
          <Route path="docs" element={<Docs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
