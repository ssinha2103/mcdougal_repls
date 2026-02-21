import { Ruler, ClipboardCheck, Lightbulb, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { UrlAnalysis } from "@shared/schema";

interface SeoAuditPanelProps {
  analysis: UrlAnalysis;
}

export function SeoAuditPanel({ analysis }: SeoAuditPanelProps) {
  const getProgressColor = (length: number, optimal: { min: number; max: number }) => {
    if (length === 0) return "bg-red-500";
    if (length < optimal.min) return "bg-yellow-500";
    if (length > optimal.max) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getProgressWidth = (length: number, max: number) => {
    return Math.min((length / max) * 100, 100);
  };

  const getCountColor = (length: number, optimal: { min: number; max: number }) => {
    if (length === 0) return "text-red-600";
    if (length < optimal.min || length > optimal.max) return "text-yellow-600";
    return "text-green-600";
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'info': return <Info className="w-4 h-4 text-blue-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getIssueColors = (type: string) => {
    switch (type) {
      case 'success': return "bg-green-50 border-green-200 text-green-800";
      case 'warning': return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case 'error': return "bg-red-50 border-red-200 text-red-800";
      case 'info': return "bg-blue-50 border-blue-200 text-blue-800";
      default: return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getIssueDescColors = (type: string) => {
    switch (type) {
      case 'success': return "text-green-600";
      case 'warning': return "text-yellow-600";
      case 'error': return "text-red-600";
      case 'info': return "text-blue-600";
      default: return "text-blue-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Character Counts */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm" data-testid="character-counts">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Ruler className="w-5 h-5 mr-2 text-muted-foreground" />
          Character Counts
        </h2>
        
        <div className="space-y-4">
          {/* Title Length */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Title Tag</span>
              <span className={`text-sm font-medium ${getCountColor(analysis.titleLength, { min: 30, max: 60 })}`} data-testid="text-title-count">
                {analysis.titleLength}/60
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(analysis.titleLength, { min: 30, max: 60 })}`}
                style={{ width: `${getProgressWidth(analysis.titleLength, 60)}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Optimal length: 30-60 characters</p>
          </div>
          
          {/* Meta Description Length */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Meta Description</span>
              <span className={`text-sm font-medium ${getCountColor(analysis.descriptionLength, { min: 120, max: 160 })}`} data-testid="text-description-count">
                {analysis.descriptionLength}/160
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(analysis.descriptionLength, { min: 120, max: 160 })}`}
                style={{ width: `${getProgressWidth(analysis.descriptionLength, 160)}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Optimal length: 120-160 characters</p>
          </div>
        </div>
      </div>

      {/* SEO Audit Results */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm" data-testid="audit-results">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <ClipboardCheck className="w-5 h-5 mr-2 text-muted-foreground" />
          SEO Audit Results
        </h2>
        
        <div className="space-y-3">
          {analysis.issues.map((issue, index) => (
            <div 
              key={index}
              className={`flex items-start space-x-3 p-3 border rounded-md ${getIssueColors(issue.type)}`}
              data-testid={`audit-issue-${index}`}
            >
              {getIssueIcon(issue.type)}
              <div className="flex-1">
                <p className="text-sm font-medium">{issue.title}</p>
                <p className={`text-xs ${getIssueDescColors(issue.type)}`}>{issue.description}</p>
              </div>
            </div>
          ))}
          
          {analysis.issues.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <p>No issues detected</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm" data-testid="recommendations">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-muted-foreground" />
            Recommendations
          </h2>
          
          <div className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <div 
                key={index}
                className="p-3 bg-muted rounded-md"
                data-testid={`recommendation-${index}`}
              >
                <p className="text-sm font-medium text-foreground mb-1">{recommendation.title}</p>
                <p className="text-xs text-muted-foreground">{recommendation.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
