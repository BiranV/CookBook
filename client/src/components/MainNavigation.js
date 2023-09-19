import { Link } from "react-router-dom";

export default function MainNavigation() {
  return (
    <header className="header">
      <Link onClick={() => window.location.href = "/"} className="logo">CookBook</Link>
    </header >
  )
}
