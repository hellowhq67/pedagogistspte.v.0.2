import React from "react";
import { Card } from "@/components/ui/card";
import { useUserHistory } from "@/hooks/useUserHistory";
import { format } from "date-fns";

export function HistoryPanel() {
  const { attempts, clearHistory } = useUserHistory();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Practice History</h2>
        <button 
          onClick={clearHistory}
          className="text-sm text-red-500 hover:text-red-600"
        >
          Clear History
        </button>
      </div>

      {attempts.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No practice history yet. Start practicing to see your results here.
        </Card>
      ) : (
        <div className="space-y-2">
          {attempts.slice().reverse().map((attempt, i) => (
            <Card key={i} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold capitalize">{attempt.testType.replace("-", " ")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(attempt.timestamp), "PPP p")}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {attempt.score?.overallScore || attempt.score?.overall || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Overall Score</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
