"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-secondary hover:bg-muted transition-colors border border-border flex items-center justify-center relative overflow-hidden group"
      aria-label="Toggle theme"
    >
      <motion.div
        animate={{ y: theme === "dark" ? 0 : 30 }}
        className="text-primary"
      >
        <Moon size={18} />
      </motion.div>
      <motion.div
        initial={{ y: -30 }}
        animate={{ y: theme === "light" ? -18 : -30 }}
        className="absolute text-yellow-500"
      >
        <Sun size={18} />
      </motion.div>
    </button>
  );
}
