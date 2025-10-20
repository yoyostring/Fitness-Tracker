"use client";
import Header from "./components/header";
import Plan from "./components/plan";
import QuickActions from "./components/quickActions";
import Calories from "./components/calories";

export default function Home() {
  return (
    <div className="px-4">
      <Header />
      <Plan />
      <div className="bottom-section">
        <QuickActions />
        <Calories />
      </div>
    </div>
  );
}
