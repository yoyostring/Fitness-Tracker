"use client";
import { usePathname } from "next/navigation";
import "./header.css";
import Link from "next/link";
import SignOutButton from "./signOutButton";

export default function Header() {
  const navItems = [
    { name: "Dashboard", href: "/" },
    { name: "Workouts", href: "/workouts" },
    { name: "Nutrition", href: "/nutrition" },
  ];
  const pathname = usePathname(); // this replaces usestate
  return (
    <div>
      <div className="header-container">
        <div className="flex items-center justify-between">
          <div className="font-logo">Fitness Tracker</div>
          <div className="nav-container">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-item ${pathname === item.href ? "active" : ""}`} // active is what changes the font and boldness
              >
                {item.name}
              </Link>
            ))}
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
