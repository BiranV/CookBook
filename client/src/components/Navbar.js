import { Fragment } from 'react'
import { Outlet } from 'react-router-dom'
import MainNavigation from './MainNavigation'

export default function Navbar() {
  return (
    <Fragment>
      <MainNavigation />
      <Outlet />
    </Fragment>
  )
} 