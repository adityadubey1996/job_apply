"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-slate-950 py-4 px-6 flex justify-between items-center">
        <div className="text-2xl font-bold">TailorCV</div>
        <div className="space-x-4">
          <Button
            variant="outline"
            className="text-white border-white hover:bg-slate-800"
            onClick={() => {
              navigate("/login");
            }}
          >
            Login
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => {
              navigate("/register");
            }}
          >
            Sign Up
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Elevate Your Job Search
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 text-slate-300"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Create ATS-friendly resumes with AI and land your dream job
            effortlessly.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => {
                navigate("/login");
              }}
            >
              Start Your Journey
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-4 text-center">
        <p className="text-slate-400 text-sm">
          © 2024 TailorCV. Designed for success.
        </p>
      </footer>
    </div>
  );
}
