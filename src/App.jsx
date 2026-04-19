import { useState } from 'react'
import Home from './pages/Home.jsx'
import ProjectSeed from './pages/ProjectSeed.jsx'
import ProjectInternship from './pages/ProjectInternship.jsx'
import ProjectDesign from './pages/ProjectDesign.jsx'

export default function App() {
  const [scene, setScene] = useState('home')
  const navigate = (target) => {
    setScene(target)
    window.scrollTo(0, 0)
  }

  return (
    <>
      {scene === 'home'        && <Home onNavigate={navigate} />}
      {scene === 'seed'        && <ProjectSeed onBack={() => navigate('home')} />}
      {scene === 'internship'  && <ProjectInternship onBack={() => navigate('home')} />}
      {scene === 'design'      && <ProjectDesign onBack={() => navigate('home')} />}
    </>
  )
}
