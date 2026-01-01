import { WritingQuestion } from "@/data/writingQuestions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WritingTestProps {
  question: WritingQuestion;
  onComplete: (score: any, text: string) => void;
  onNext: () => void;
}

export function WritingTest({ question, onComplete, onNext }: WritingTestProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">{question.title}</h2>
      <p className="mb-4">{question.instruction}</p>
      {question.content.sourceText && (
        <div className="p-4 bg-muted rounded-lg mb-4">
          {question.content.sourceText}
        </div>
      )}
      <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
        Writing Test Interface Placeholder
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={onNext}>Next Question</Button>
      </div>
    </Card>
  );
}
