import { type AccessibilityAssessment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";

interface AccessibilityPanelProps {
  accessibility: AccessibilityAssessment;
}

export function AccessibilityPanel({ accessibility }: AccessibilityPanelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-chart-2";
    if (score >= 70) return "text-chart-3";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Improvement";
  };

  return (
    <Card className="hover-elevate">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Accessibility Score</span>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(accessibility.score)}`} data-testid="accessibility-score">
              {accessibility.score}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {getScoreLabel(accessibility.score)}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {accessibility.issues.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Accessibility Issues
            </h4>
            <ul className="space-y-1">
              {accessibility.issues.map((issue, index) => (
                <li key={index} className="text-sm text-muted-foreground pl-6" data-testid={`accessibility-issue-${index}`}>
                  • {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {accessibility.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-chart-3" />
              Recommendations
            </h4>
            <ul className="space-y-1">
              {accessibility.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground pl-6" data-testid={`accessibility-recommendation-${index}`}>
                  • {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
