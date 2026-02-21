import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lightbulb,
  Target,
  TrendingUp,
  FileText,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Key,
  Layers,
  ListChecks,
  MessageSquare,
  HelpCircle,
  FileQuestion,
  Zap,
  ChartBar,
  Search,
  ShoppingCart,
  MapPin,
  Users,
  Brain,
  PenTool,
  Newspaper
} from "lucide-react";
import type { PAAQuestion, RelatedSearch } from "@shared/schema";

interface ContentInsightsProps {
  paaQuestions: PAAQuestion[];
  relatedSearches: RelatedSearch[];
  keyword: string;
}

// Helper function to analyze question types
function analyzeQuestionPatterns(questions: PAAQuestion[]) {
  const patterns = {
    what: 0,
    how: 0,
    why: 0,
    when: 0,
    where: 0,
    can: 0,
    is: 0,
    does: 0,
    which: 0,
    should: 0
  };

  questions.forEach(q => {
    const lowerQ = q.question.toLowerCase();
    Object.keys(patterns).forEach(key => {
      if (lowerQ.startsWith(key)) {
        patterns[key as keyof typeof patterns]++;
      }
    });
  });

  return patterns;
}

// Determine content types based on question patterns
function suggestContentTypes(questions: PAAQuestion[]) {
  const patterns = analyzeQuestionPatterns(questions);
  const suggestions = [];

  if (patterns.how >= 2) {
    suggestions.push({
      type: "How-to Guide",
      icon: <BookOpen className="h-4 w-4" />,
      description: "Step-by-step tutorial covering the 'how' questions",
      priority: "high"
    });
  }

  if (patterns.what >= 2) {
    suggestions.push({
      type: "Comprehensive Guide",
      icon: <FileText className="h-4 w-4" />,
      description: "In-depth article explaining concepts and definitions",
      priority: "high"
    });
  }

  if (patterns.why >= 1) {
    suggestions.push({
      type: "Explainer Article",
      icon: <Brain className="h-4 w-4" />,
      description: "Article explaining reasons and motivations",
      priority: "medium"
    });
  }

  if ((patterns.is + patterns.does + patterns.can) >= 3) {
    suggestions.push({
      type: "FAQ Page",
      icon: <HelpCircle className="h-4 w-4" />,
      description: "Quick answers to yes/no and factual questions",
      priority: "high"
    });
  }

  if (questions.length >= 5 && (patterns.what + patterns.which) >= 2) {
    suggestions.push({
      type: "Comparison Article",
      icon: <ChartBar className="h-4 w-4" />,
      description: "Compare different options or approaches",
      priority: "medium"
    });
  }

  if (patterns.when >= 1) {
    suggestions.push({
      type: "Timeline/Schedule Content",
      icon: <Zap className="h-4 w-4" />,
      description: "Content focusing on timing and scheduling",
      priority: "low"
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      type: "General Resource Page",
      icon: <Newspaper className="h-4 w-4" />,
      description: "Comprehensive resource covering various aspects",
      priority: "medium"
    });
  }

  return suggestions;
}

// Analyze overall search intent
function analyzeSearchIntent(questions: PAAQuestion[], relatedSearches: RelatedSearch[]) {
  const intents = {
    informational: 0,
    commercial: 0,
    navigational: 0,
    transactional: 0
  };

  // Analyze questions
  questions.forEach(q => {
    const lowerQ = q.question.toLowerCase();
    if (lowerQ.includes('buy') || lowerQ.includes('price') || lowerQ.includes('cost') || 
        lowerQ.includes('best') || lowerQ.includes('review')) {
      intents.commercial++;
    } else if (lowerQ.includes('login') || lowerQ.includes('website') || lowerQ.includes('find')) {
      intents.navigational++;
    } else if (lowerQ.includes('purchase') || lowerQ.includes('order') || lowerQ.includes('get')) {
      intents.transactional++;
    } else {
      intents.informational++;
    }
  });

  // Analyze related searches
  relatedSearches.forEach(r => {
    const lowerR = r.query.toLowerCase();
    if (lowerR.includes('buy') || lowerR.includes('price') || lowerR.includes('cheap') || 
        lowerR.includes('best') || lowerR.includes('review') || lowerR.includes('vs')) {
      intents.commercial++;
    } else if (lowerR.includes('login') || lowerR.includes('sign') || lowerR.includes('download')) {
      intents.navigational++;
    } else if (lowerR.includes('purchase') || lowerR.includes('shop') || lowerR.includes('order')) {
      intents.transactional++;
    } else {
      intents.informational++;
    }
  });

  // Determine primary intent
  const primaryIntent = Object.entries(intents)
    .sort(([, a], [, b]) => b - a)[0][0];

  const intentDetails = {
    informational: {
      name: "Informational",
      icon: <Search className="h-4 w-4" />,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      description: "Users are looking for information and answers"
    },
    commercial: {
      name: "Commercial Investigation",
      icon: <ShoppingCart className="h-4 w-4" />,
      color: "bg-amber-500/10 text-amber-500 border-amber-500/30",
      description: "Users are researching products or services"
    },
    navigational: {
      name: "Navigational",
      icon: <MapPin className="h-4 w-4" />,
      color: "bg-green-500/10 text-green-500 border-green-500/30",
      description: "Users are looking for specific websites or pages"
    },
    transactional: {
      name: "Transactional",
      icon: <Zap className="h-4 w-4" />,
      color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
      description: "Users are ready to make a purchase or take action"
    }
  };

  return {
    primary: primaryIntent,
    details: intentDetails[primaryIntent as keyof typeof intentDetails],
    distribution: intents
  };
}

// Extract long-tail keywords from questions
function extractLongTailKeywords(questions: PAAQuestion[], keyword: string) {
  const keywords = new Set<string>();
  const baseKeyword = keyword.toLowerCase();

  questions.forEach(q => {
    const lowerQ = q.question.toLowerCase();
    
    // Extract phrases that include the base keyword
    if (lowerQ.includes(baseKeyword)) {
      // Find the position of the keyword and extract surrounding words
      const words = lowerQ.split(' ');
      const keywordIndex = words.findIndex(w => w.includes(baseKeyword.split(' ')[0]));
      
      if (keywordIndex !== -1) {
        // Get 2-4 word phrases around the keyword
        for (let start = Math.max(0, keywordIndex - 1); start <= keywordIndex; start++) {
          for (let length = 2; length <= 4; length++) {
            if (start + length <= words.length) {
              const phrase = words.slice(start, start + length).join(' ');
              if (phrase.includes(baseKeyword.split(' ')[0]) && phrase.length > baseKeyword.length) {
                keywords.add(phrase.replace(/[?.,!]/g, ''));
              }
            }
          }
        }
      }
    }
    
    // Also extract question-based phrases
    const questionWords = ['what is', 'how to', 'why do', 'when to', 'where to', 'can you', 'should i'];
    questionWords.forEach(qw => {
      if (lowerQ.startsWith(qw) && lowerQ.includes(baseKeyword)) {
        const phrase = lowerQ.substring(qw.length).replace(/[?.,!]/g, '').trim();
        if (phrase.length > 3 && phrase.length < 50) {
          keywords.add(phrase);
        }
      }
    });
  });

  return Array.from(keywords).slice(0, 8); // Return top 8 long-tail keywords
}

// Generate content series ideas
function generateContentSeriesIdeas(questions: PAAQuestion[]) {
  const patterns = analyzeQuestionPatterns(questions);
  const ideas = [];

  if (patterns.how >= 3) {
    ideas.push({
      title: "Complete How-To Series",
      description: "Multi-part tutorial series covering each 'how to' aspect",
      parts: Math.min(patterns.how, 5)
    });
  }

  if ((patterns.what + patterns.why) >= 4) {
    ideas.push({
      title: "Ultimate Guide Series",
      description: "Comprehensive series explaining all aspects and reasons",
      parts: 3
    });
  }

  if (questions.length >= 10) {
    ideas.push({
      title: "FAQ Series",
      description: "Weekly FAQ posts addressing different question categories",
      parts: Math.ceil(questions.length / 5)
    });
  }

  if (patterns.is + patterns.can + patterns.does >= 4) {
    ideas.push({
      title: "Myth-Busting Series",
      description: "Series addressing common misconceptions and facts",
      parts: 3
    });
  }

  return ideas;
}

// Generate SEO action items
function generateSEOActionItems(questions: PAAQuestion[], relatedSearches: RelatedSearch[], contentTypes: any[]) {
  const items = [];
  const patterns = analyzeQuestionPatterns(questions);

  // FAQ-related actions
  if (questions.length >= 5) {
    items.push({
      action: `Create a FAQ section covering ${questions.length} questions`,
      priority: "high",
      icon: <FileQuestion className="h-4 w-4" />,
      description: "Add structured FAQ schema markup for better SERP visibility"
    });
  }

  // How-to content actions
  if (patterns.how >= 2) {
    items.push({
      action: `Write a comprehensive guide addressing the ${patterns.how} 'how to' questions`,
      priority: "high",
      icon: <PenTool className="h-4 w-4" />,
      description: "Include step-by-step instructions with images or videos"
    });
  }

  // Featured snippet optimization
  if (patterns.what >= 2 || patterns.is >= 2) {
    items.push({
      action: "Optimize for featured snippets by directly answering definition questions",
      priority: "medium",
      icon: <Target className="h-4 w-4" />,
      description: "Format answers in 40-60 word paragraphs immediately after headings"
    });
  }

  // Related searches targeting
  if (relatedSearches.length >= 3) {
    items.push({
      action: `Target ${Math.min(relatedSearches.length, 5)} related searches in separate articles`,
      priority: "medium",
      icon: <Layers className="h-4 w-4" />,
      description: "Create dedicated content for high-value related searches"
    });
  }

  // Content depth recommendations
  if (questions.length >= 8) {
    items.push({
      action: "Create a pillar page with comprehensive coverage",
      priority: "high",
      icon: <BookOpen className="h-4 w-4" />,
      description: "Build a 2000+ word authoritative resource with internal links"
    });
  }

  // Schema markup
  items.push({
    action: "Implement appropriate schema markup",
    priority: "medium",
    icon: <Sparkles className="h-4 w-4" />,
    description: contentTypes[0]?.type === "How-to Guide" ? "Use HowTo schema" : 
                 contentTypes[0]?.type === "FAQ Page" ? "Use FAQPage schema" : 
                 "Use Article schema with proper structured data"
  });

  return items;
}

export function ContentInsights({ paaQuestions, relatedSearches, keyword }: ContentInsightsProps) {
  if (!paaQuestions.length && !relatedSearches.length) {
    return null;
  }

  const contentTypes = suggestContentTypes(paaQuestions);
  const searchIntent = analyzeSearchIntent(paaQuestions, relatedSearches);
  const longTailKeywords = extractLongTailKeywords(paaQuestions, keyword);
  const contentSeries = generateContentSeriesIdeas(paaQuestions);
  const seoActionItems = generateSEOActionItems(paaQuestions, relatedSearches, contentTypes);

  const contentDepth = paaQuestions.length >= 8 ? "comprehensive" : 
                       paaQuestions.length >= 4 ? "moderate" : "quick";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8"
    >
      <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-background to-primary/5">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Content Insights & Recommendations</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                AI-powered analysis based on {paaQuestions.length} questions and {relatedSearches.length} related searches
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Content Strategy Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Content Strategy</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Content Types */}
              <Card className="border-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Recommended Content Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AnimatePresence>
                    {contentTypes.map((type, index) => (
                      <motion.div
                        key={type.type}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className={`mt-1 rounded-md p-1.5 ${
                          type.priority === 'high' ? 'bg-success/10 text-success' :
                          type.priority === 'medium' ? 'bg-warning/10 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {type.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{type.type}</p>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                        <Badge variant="outline" className={
                          type.priority === 'high' ? 'border-success/50 text-success' :
                          type.priority === 'medium' ? 'border-warning/50 text-warning' :
                          'border-muted'
                        }>
                          {type.priority}
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* User Intent & Content Depth */}
              <Card className="border-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Intent & Depth Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search Intent */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Primary Search Intent</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={searchIntent.details.color}>
                        {searchIntent.details.icon}
                        <span className="ml-1">{searchIntent.details.name}</span>
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{searchIntent.details.description}</p>
                  </div>

                  <Separator />

                  {/* Content Depth */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Recommended Content Depth</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={
                        contentDepth === 'comprehensive' ? 'border-purple-500/50 bg-purple-500/10 text-purple-500' :
                        contentDepth === 'moderate' ? 'border-blue-500/50 bg-blue-500/10 text-blue-500' :
                        'border-green-500/50 bg-green-500/10 text-green-500'
                      }>
                        <Layers className="mr-1 h-3 w-3" />
                        {contentDepth === 'comprehensive' ? 'Comprehensive Guide (2000+ words)' :
                         contentDepth === 'moderate' ? 'Detailed Article (1000-2000 words)' :
                         'Quick Answer Post (500-1000 words)'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {contentDepth === 'comprehensive' ? 
                        'Multiple questions indicate users need thorough coverage' :
                       contentDepth === 'moderate' ?
                        'Balance between depth and readability' :
                        'Users want quick, direct answers'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Keyword Opportunities */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Keyword Opportunities</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Long-tail Keywords */}
              {longTailKeywords.length > 0 && (
                <Card className="border-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Long-tail Keywords to Target</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {longTailKeywords.map((kw, index) => (
                        <motion.div
                          key={kw}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Badge variant="secondary" className="font-mono text-xs">
                            {kw}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Content Series Ideas */}
              {contentSeries.length > 0 && (
                <Card className="border-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Content Series Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {contentSeries.map((series, index) => (
                      <motion.div
                        key={series.title}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{series.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {series.parts} parts
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{series.description}</p>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* SEO Action Items */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">SEO Action Checklist</h3>
            </div>

            <Card className="border-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {seoActionItems.map((item, index) => (
                      <motion.div
                        key={item.action}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group flex items-start gap-3 rounded-lg border p-3 transition-all hover-elevate"
                      >
                        <div className={`mt-0.5 rounded-md p-1.5 ${
                          item.priority === 'high' ? 'bg-success/10 text-success' :
                          item.priority === 'medium' ? 'bg-warning/10 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{item.action}</p>
                            <Badge variant="outline" className={
                              item.priority === 'high' ? 'border-success/50 text-success' :
                              item.priority === 'medium' ? 'border-warning/50 text-warning' :
                              'border-muted'
                            }>
                              {item.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="border-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Questions</p>
                    <p className="text-2xl font-bold">{paaQuestions.length}</p>
                  </div>
                  <HelpCircle className="h-8 w-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Related</p>
                    <p className="text-2xl font-bold">{relatedSearches.length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-info/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Content Ideas</p>
                    <p className="text-2xl font-bold">{contentTypes.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-success/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Action Items</p>
                    <p className="text-2xl font-bold">{seoActionItems.length}</p>
                  </div>
                  <ListChecks className="h-8 w-8 text-warning/20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}