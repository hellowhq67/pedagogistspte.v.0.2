import { useState, useEffect } from "react";

export function useScoringLimit() {
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [canScore, setCanScore] = useState(true);

  useEffect(() => {
    // Load today's usage from localStorage
    const today = new Date().toDateString();
    const savedUsage = localStorage.getItem("dailyScoringUsage");
    
    if (savedUsage) {
      const usage = JSON.parse(savedUsage);
      if (usage.date === today) {
        setRemainingAttempts(Math.max(0, 5 - usage.count));
        setCanScore(usage.count < 5);
      } else {
        // Reset for new day
        localStorage.setItem("dailyScoringUsage", JSON.stringify({ date: today, count: 0 }));
        setRemainingAttempts(5);
        setCanScore(true);
      }
    } else {
      // Initialize if not exists
      localStorage.setItem("dailyScoringUsage", JSON.stringify({ date: today, count: 0 }));
      setRemainingAttempts(5);
      setCanScore(true);
    }
  }, []);

  const incrementUsage = async (): Promise<boolean> => {
    const today = new Date().toDateString();
    const savedUsage = localStorage.getItem("dailyScoringUsage");
    
    let currentUsage = { date: today, count: 0 };
    
    if (savedUsage) {
      const parsed = JSON.parse(savedUsage);
      if (parsed.date === today) {
        currentUsage = parsed;
      }
    }
    
    if (currentUsage.count >= 5) {
      return false; // Limit reached
    }
    
    currentUsage.count += 1;
    localStorage.setItem("dailyScoringUsage", JSON.stringify(currentUsage));
    
    setRemainingAttempts(Math.max(0, 5 - currentUsage.count));
    setCanScore(currentUsage.count < 5);
    
    // In a real app, you would also update this on your server
    try {
      await fetch("/api/user/scoring-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: today, count: currentUsage.count }),
      });
    } catch (error) {
      console.error("Failed to update scoring usage on server:", error);
    }
    
    return true;
  };

  const resetUsage = () => {
    const today = new Date().toDateString();
    localStorage.setItem("dailyScoringUsage", JSON.stringify({ date: today, count: 0 }));
    setRemainingAttempts(5);
    setCanScore(true);
  };

  return {
    remainingAttempts,
    canScore,
    incrementUsage,
    resetUsage,
  };
}