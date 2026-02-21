import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type KeywordGroup, type GenerateKeywordsResponse } from "@shared/schema";

interface StatsPanelProps {
  keywordGroups: KeywordGroup[];
  results: GenerateKeywordsResponse | null;
}

export default function StatsPanel({ 
  keywordGroups, 
  results
}: StatsPanelProps) {
  
  const totalPossibleCombinations = keywordGroups.reduce((acc, group) => {
    const uniqueKeywords = Array.from(new Set(group.keywords.filter((k: string) => k.trim().length > 0)));
    return acc === 0 ? uniqueKeywords.length : acc * uniqueKeywords.length;
  }, 0);

  const progressPercentage = results 
    ? Math.min((results.totalCombinations / totalPossibleCombinations) * 100, 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <Card className="backdrop-blur-xl bg-white/70 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold">Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Total Combinations</span>
            <span className="text-2xl font-bold">
              {results ? results.totalCombinations.toLocaleString() : totalPossibleCombinations.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Keyword Lists</span>
            <span className="text-2xl font-bold">{keywordGroups.length}</span>
          </div>
          {keywordGroups.length > 0 && (
            <div className="text-xs text-gray-500 mt-2">
              Calculation: {keywordGroups.map(g => Array.from(new Set(g.keywords.filter((k: string) => k.trim().length > 0))).length).join(' × ')} = {totalPossibleCombinations.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
