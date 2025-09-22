import { BrowserRouter as Router, Routes, Route } from "react-router";
import Navigation from "@/react-app/components/Navigation";
import HomePage from "@/react-app/pages/Home";
import AdminPage from "@/react-app/pages/AdminPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}
