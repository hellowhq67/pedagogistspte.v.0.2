import { ListeningQuestion } from "@/data/listeningQuestions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ListeningTestProps {
  question: ListeningQuestion;
  questionIndex: number;
  totalQuestions: number;
  onComplete: (score: any, correct: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function ListeningTest({ question, onNext }: ListeningTestProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">{question.title}</h2>
      <p className="mb-4">{question.instruction}</p>
      <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
        Listening Test Interface Placeholder
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={onNext}>Next Question</Button>
      </div>
    </Card>
  );
}
