import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  HelpCircle, 
  ArrowRight, 
  Download, 
  ChevronDown, 
  ChevronUp,
  Search,
  TrendingUp,
  ShoppingCart,
  MapPin,
  FileText,
  CircleHelp,
  Clock,
  Target,
  Users,
  MessageCircle,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PAAQuestion, RelatedSearch } from "@shared/schema";

interface ResultsSectionProps {
  paaQuestions: PAAQuestion[];
  relatedSearches: RelatedSearch[];
  keyword: string;
  onRelatedSearchClick?: (query: string) => void;
}

// Helper function to detect question type
function getQuestionType(question: string): { type: string; icon: React.ReactNode; color: string } {
  const q = question.toLowerCase();
  
  if (q.startsWith('what')) {
    return { type: 'What', icon: <FileText className="h-3 w-3" />, color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' };
  } else if (q.startsWith('how')) {
    return { type: 'How', icon: <Target className="h-3 w-3" />, color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' };
  } else if (q.startsWith('why')) {
    return { type: 'Why', icon: <CircleHelp className="h-3 w-3" />, color: 'bg-orange-500/10 text-orange-500 border-orange-500/30' };
  } else if (q.startsWith('when')) {
    return { type: 'When', icon: <Clock className="h-3 w-3" />, color: 'bg-green-500/10 text-green-500 border-green-500/30' };
  } else if (q.startsWith('where')) {
    return { type: 'Where', icon: <MapPin className="h-3 w-3" />, color: 'bg-red-500/10 text-red-500 border-red-500/30' };
  } else if (q.startsWith('can') || q.startsWith('could')) {
    return { type: 'Can', icon: <CheckCircle2 className="h-3 w-3" />, color: 'bg-teal-500/10 text-teal-500 border-teal-500/30' };
  } else if (q.startsWith('is') || q.startsWith('are')) {
    return { type: 'Is/Are', icon: <MessageCircle className="h-3 w-3" />, color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30' };
  } else if (q.startsWith('does') || q.startsWith('do')) {
    return { type: 'Does/Do', icon: <Users className="h-3 w-3" />, color: 'bg-pink-500/10 text-pink-500 border-pink-500/30' };
  } else {
    return { type: 'Other', icon: <HelpCircle className="h-3 w-3" />, color: 'bg-gray-500/10 text-gray-500 border-gray-500/30' };
  }
}

// Helper function to classify search intent
function getSearchIntent(query: string): { intent: string; icon: React.ReactNode; color: string } {
  const q = query.toLowerCase();
  
  // Commercial intent keywords
  if (q.includes('buy') || q.includes('price') || q.includes('cost') || q.includes('cheap') || 
      q.includes('best') || q.includes('review') || q.includes('vs') || q.includes('compare')) {
    return { 
      intent: 'Commercial', 
      icon: <ShoppingCart className="h-3 w-3" />, 
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
    };
  }
  
  // Navigational intent keywords
  if (q.includes('login') || q.includes('sign') || q.includes('download') || 
      q.includes('website') || q.includes('app')) {
    return { 
      intent: 'Navigational', 
      icon: <MapPin className="h-3 w-3" />, 
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' 
    };
  }
  
  // Informational intent (default)
  return { 
    intent: 'Informational', 
    icon: <Search className="h-3 w-3" />, 
    color: 'bg-green-500/10 text-green-500 border-green-500/30' 
  };
}

// Question Analysis Component
function QuestionAnalysis({ questions }: { questions: PAAQuestion[] }) {
  const questionTypes = questions.reduce((acc, q) => {
    const { type } = getQuestionType(q.question);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedTypes = Object.entries(questionTypes)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => `${count} ${type}`)
    .join(', ');

  return (
    <Card className="mb-6 overflow-hidden border-primary/20 bg-primary/5" data-testid="card-question-analysis">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Question Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md bg-card p-3">
            <p className="text-xs text-muted-foreground">Total Questions</p>
            <p className="text-2xl font-bold text-primary">{questions.length}</p>
          </div>
          <div className="rounded-md bg-card p-3 sm:col-span-2">
            <p className="text-xs text-muted-foreground">Question Type Breakdown</p>
            <p className="mt-1 text-sm font-medium">{sortedTypes || 'No questions'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(questionTypes).map(([type, count]) => {
            const { icon, color } = getQuestionType(`${type} example`);
            return (
              <Badge key={type} variant="outline" className={`${color} gap-1`}>
                {icon}
                <span>{type}: {count}</span>
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Export functions
function exportToCSV(keyword: string, questions: PAAQuestion[]) {
  const headers = ['Keyword', 'Question', 'Answer', 'Question Type'];
  const rows = questions.map(q => {
    const { type } = getQuestionType(q.question);
    return [
      keyword,
      q.question,
      q.answer || 'No answer available',
      type
    ];
  });
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `paa-questions-${keyword.replace(/\s+/g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToJSON(keyword: string, questions: PAAQuestion[], relatedSearches: RelatedSearch[]) {
  const data = {
    keyword,
    exportDate: new Date().toISOString(),
    paaQuestions: questions.map(q => ({
      ...q,
      questionType: getQuestionType(q.question).type
    })),
    relatedSearches: relatedSearches.map(r => ({
      ...r,
      intent: getSearchIntent(r.query).intent
    }))
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `search-data-${keyword.replace(/\s+/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ResultsSection({ paaQuestions, relatedSearches, keyword, onRelatedSearchClick }: ResultsSectionProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const allPAAText = (paaQuestions || []).map(q => q.question).join('\n');
  const allRelatedText = (relatedSearches || []).map(r => r.query).join('\n');

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  // Group related searches by intent
  const groupedSearches = (relatedSearches || []).reduce((acc, search) => {
    const { intent } = getSearchIntent(search.query);
    if (!acc[intent]) acc[intent] = [];
    acc[intent].push(search);
    return acc;
  }, {} as Record<string, RelatedSearch[]>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Question Analysis */}
      {(paaQuestions || []).length > 0 && (
        <QuestionAnalysis questions={paaQuestions} />
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* People Also Ask Section */}
        <Card className="overflow-hidden" data-testid="card-paa">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success/10">
                <HelpCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle className="text-xl">People Also Ask</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Found {(paaQuestions || []).length} questions
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {(paaQuestions || []).length > 0 && (
                <>
                  <div className="relative">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      data-testid="button-export"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Export
                    </Button>
                    {showExportMenu && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-md border bg-popover p-1 shadow-md">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            exportToCSV(keyword, paaQuestions);
                            setShowExportMenu(false);
                          }}
                          data-testid="button-export-csv"
                        >
                          Export CSV
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            exportToJSON(keyword, paaQuestions, relatedSearches);
                            setShowExportMenu(false);
                          }}
                          data-testid="button-export-json"
                        >
                          Export JSON
                        </Button>
                      </div>
                    )}
                  </div>
                  <CopyButton text={allPAAText} label="Copy All" testId="button-copy-all-paa" />
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!(paaQuestions || []).length ? (
              <div className="py-8 text-center">
                <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  No "People Also Ask" questions found
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a more specific keyword or check your search settings
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {(paaQuestions || []).map((item, index) => {
                  const { type, icon, color } = getQuestionType(item.question);
                  const isExpanded = expandedQuestions.has(index);
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div
                        className="group relative rounded-md border border-success/20 bg-card transition-all hover-elevate"
                        data-testid={`paa-question-${index}`}
                      >
                        <Collapsible open={isExpanded} onOpenChange={() => toggleQuestion(index)}>
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="shrink-0 border-success/30 bg-success/10 text-success"
                                  >
                                    {index + 1}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`${color} gap-1`}
                                    data-testid={`question-type-${index}`}
                                  >
                                    {icon}
                                    <span>{type}</span>
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium leading-relaxed">{item.question}</p>
                              </div>
                              <div className="flex items-start gap-1">
                                {item.answer && (
                                  <CollapsibleTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      data-testid={`button-expand-${index}`}
                                    >
                                      {isExpanded ? (
                                        <ChevronUp className="h-4 w-4" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </CollapsibleTrigger>
                                )}
                                <div className="opacity-0 transition-opacity group-hover:opacity-100">
                                  <CopyButton text={item.question} label="" testId={`button-copy-paa-${index}`} />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {item.answer ? (
                            <CollapsibleContent>
                              <div className="border-t border-success/10 bg-success/5 px-4 py-3">
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  {item.answer}
                                </p>
                              </div>
                            </CollapsibleContent>
                          ) : (
                            <div className="border-t border-gray-200/10 bg-gray-100/5 px-4 py-2">
                              <p className="text-xs italic text-muted-foreground/60">
                                No answer available
                              </p>
                            </div>
                          )}
                        </Collapsible>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </CardContent>
        </Card>

        {/* Related Searches Section */}
        <Card className="overflow-hidden" data-testid="card-related">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-info/10">
                <ArrowRight className="h-5 w-5 text-info" />
              </div>
              <div>
                <CardTitle className="text-xl">Related Searches</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Found {(relatedSearches || []).length} searches
                </p>
              </div>
            </div>
            {(relatedSearches || []).length > 0 && (
              <CopyButton text={allRelatedText} label="Copy All" testId="button-copy-all-related" />
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!(relatedSearches || []).length ? (
              <div className="py-8 text-center">
                <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  No related searches found
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This keyword may be too specific or niche
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {Object.entries(groupedSearches).map(([intent, searches], groupIndex) => {
                  const { icon, color } = getSearchIntent(searches[0].query);
                  
                  return (
                    <motion.div
                      key={intent}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: groupIndex * 0.1 }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${color} gap-1`}>
                            {icon}
                            <span>{intent}</span>
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ({searches.length} searches)
                          </span>
                        </div>
                        <div className="space-y-2">
                          {searches.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: groupIndex * 0.1 + index * 0.02 }}
                            >
                              <div
                                className="group relative flex items-center justify-between gap-2 rounded-md border border-info/20 bg-card p-3 transition-all hover-elevate"
                                data-testid={`related-search-${relatedSearches.indexOf(item)}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="shrink-0 border-info/30 bg-info/10 text-info"
                                  >
                                    {relatedSearches.indexOf(item) + 1}
                                  </Badge>
                                  <p className="font-mono text-sm">{item.query}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {onRelatedSearchClick && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => onRelatedSearchClick(item.query)}
                                      data-testid={`button-search-related-${relatedSearches.indexOf(item)}`}
                                    >
                                      <Search className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <div className="opacity-0 transition-opacity group-hover:opacity-100">
                                    <CopyButton 
                                      text={item.query} 
                                      label="" 
                                      testId={`button-copy-related-${relatedSearches.indexOf(item)}`} 
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
