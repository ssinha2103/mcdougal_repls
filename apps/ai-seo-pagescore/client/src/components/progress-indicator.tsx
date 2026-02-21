import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Loader2, AlertCircle } from "lucide-react";

interface ProgressItem {
  domain: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  step?: string;
}

interface ProgressIndicatorProps {
  items: ProgressItem[];
  overallProgress: number;
  currentStep?: string;
  onCancel?: () => void;
}

export function ProgressIndicator({ items, overallProgress, currentStep, onCancel }: ProgressIndicatorProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (item: ProgressItem) => {
    switch (item.status) {
      case 'completed':
        return 'Analysis completed';
      case 'running':
        return item.step || 'Analyzing...';
      case 'failed':
        return 'Analysis failed';
      default:
        return 'Waiting to start...';
    }
  };

  return (
    <Card className="w-full glass-card rounded-3xl border-0 shadow-2xl floating" style={{ background: 'var(--liquid-gradient-1)' }}>
      <CardHeader className="pb-6 rounded-t-3xl px-8 py-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-3 rounded-2xl glass-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))' }}>
              <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Analysis in Progress</span>
          </CardTitle>
          {onCancel && (
            <button
              onClick={onCancel}
              className="glass-card p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-300"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            >
              ×
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-8 pb-8">
        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-3 glass-card" />
          {currentStep && (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">{currentStep}</p>
          )}
        </div>
        
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 glass-card rounded-2xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="flex-shrink-0">
                {getStatusIcon(item.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                  {item.domain}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {getStatusText(item)}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {item.status === 'completed' ? '✓' : 
                 item.status === 'failed' ? '✗' : 
                 item.status === 'running' ? '...' : '⏳'}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-xs text-muted-foreground text-center">
            Enhanced concurrent processing - typically takes ~30 seconds total
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
