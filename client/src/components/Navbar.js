import { Outlet } from 'react-router-dom'
import Header from './Header'

export default function Navbar() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
} 