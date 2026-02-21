import { useState, useEffect, useRef } from "react";
import { Search, Settings, HelpCircle, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import KeywordResearch from "@/components/keyword-research";
import KeywordInputSection from "@/components/keyword-input-section";
import CombinationSettingsComponent from "@/components/combination-settings";
import ResultsSection from "@/components/results-section";
import StatsPanel from "@/components/stats-panel";
import TemplateModal from "@/components/template-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type KeywordGroup, type CombinationSettings, type FilterSettings, type GenerateKeywordsResponse } from "@shared/schema";

export default function KeywordCombiner() {
  const [keywordGroups, setKeywordGroups] = useState<KeywordGroup[]>([
    {
      id: "1",
      name: "Services",
      keywords: []
    },
    {
      id: "2", 
      name: "Business Types",
      keywords: []
    },
    {
      id: "3",
      name: "Locations", 
      keywords: []
    }
  ]);

  const [combinationSettings, setCombinationSettings] = useState<CombinationSettings>({
    pattern: "full",
    matchType: "broad",
    separator: "space",
    includeReverse: false,
    includeOriginal: false,
    removeStopwords: true,
    lowercaseOutput: false,
  });

  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    minWords: 2,
    maxWords: 10,
  });

  const [results, setResults] = useState<GenerateKeywordsResponse | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [progressState, setProgressState] = useState({ progress: 0, expectedCombinations: 0 });
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate-keywords", {
        groups: keywordGroups,
        settings: combinationSettings,
        filters: filterSettings,
      });
      return response.json();
    },
    onSuccess: (data: GenerateKeywordsResponse) => {
      setResults(data);
      toast({
        title: "Keywords Generated Successfully",
        description: `Generated ${data.totalCombinations} combinations in ${data.processingTime.toFixed(2)}s`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate keywords",
        variant: "destructive",
      });
    },
  });

  const calculateExpectedCombinations = (): number => {
    const validGroups = keywordGroups
      .map(group => group.keywords.filter(k => k.trim().length > 0))
      .filter(keywords => keywords.length > 0);

    if (validGroups.length === 0) return 0;

    if (combinationSettings.pattern === 'full') {
      return validGroups.reduce((acc, keywords) => acc * keywords.length, 1);
    } else if (combinationSettings.pattern === 'pairs') {
      let total = 0;
      for (let i = 0; i < validGroups.length; i++) {
        for (let j = i + 1; j < validGroups.length; j++) {
          total += validGroups[i].length * validGroups[j].length;
        }
      }
      return total;
    }

    return 0;
  };

  const pollJobStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/job-status/${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to check job status');
      }

      const jobStatus = await response.json();

      if (jobStatus.status === 'processing') {
        setProgressState(prev => ({
          ...prev,
          progress: jobStatus.progress
        }));
      } else if (jobStatus.status === 'completed') {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setIsProgressModalOpen(false);
        setResults(jobStatus.results);
        toast({
          title: "Keywords Generated Successfully",
          description: `Generated ${jobStatus.results.totalCombinations} combinations in ${jobStatus.results.processingTime.toFixed(2)}s`,
        });
      } else if (jobStatus.status === 'failed') {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setIsProgressModalOpen(false);
        toast({
          title: "Error",
          description: jobStatus.error || "Failed to generate keywords",
          variant: "destructive",
        });
      }
    } catch (error) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setIsProgressModalOpen(false);
      toast({
        title: "Error",
        description: "Failed to check job status",
        variant: "destructive",
      });
    }
  };

  const handleAsyncGenerate = async () => {
    try {
      const response = await apiRequest("POST", "/api/generate-keywords-async", {
        groups: keywordGroups,
        settings: combinationSettings,
        filters: filterSettings,
      });
      const data = await response.json();

      setProgressState({ progress: 0, expectedCombinations: data.expectedCombinations });
      setIsProgressModalOpen(true);

      pollingIntervalRef.current = setInterval(() => {
        pollJobStatus(data.jobId);
      }, 1000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start keyword generation",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = () => {
    if (keywordGroups.length === 0 || keywordGroups.every(group => group.keywords.length === 0)) {
      toast({
        title: "No Keywords",
        description: "Please add some keywords to generate combinations",
        variant: "destructive",
      });
      return;
    }

    const expectedCombinations = calculateExpectedCombinations();

    if (expectedCombinations > 100000) {
      handleAsyncGenerate();
    } else {
      generateMutation.mutate();
    }
  };

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleAddResearchKeywords = (keywords: string[], targetColumn: string) => {
    // Define placeholder keywords that should be replaced
    const placeholderKeywords = [
      'air conditioning repair',
      'HVAC installation', 
      'furnace maintenance',
      'heating repair',
      'cooling services',
      'duct cleaning'
    ];
    
    // Map target column to index (A=0, B=1, C=2)
    const columnIndex = targetColumn === 'A' ? 0 : targetColumn === 'B' ? 1 : 2;
    
    // Ensure we have enough groups
    if (keywordGroups.length <= columnIndex) {
      const newGroups = [...keywordGroups];
      while (newGroups.length <= columnIndex) {
        const newIndex = newGroups.length;
        const letter = ['A', 'B', 'C'][newIndex];
        newGroups.push({
          id: (newIndex + 1).toString(),
          name: `List ${letter}`,
          keywords: []
        });
      }
      setKeywordGroups(newGroups);
    }
    
    // Add keywords to the specified group
    setKeywordGroups(prev => prev.map((group, index) => {
      if (index === columnIndex) {
        // Check if current keywords are all placeholders or empty
        const currentKeywords = group.keywords;
        const isEmptyOrAllPlaceholders = currentKeywords.length === 0 || 
          currentKeywords.every(keyword => placeholderKeywords.includes(keyword));
        
        // If empty or all placeholders, replace them; otherwise add to existing
        if (isEmptyOrAllPlaceholders) {
          return { ...group, keywords: keywords };
        } else {
          return { ...group, keywords: [...group.keywords, ...keywords] };
        }
      }
      return group;
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      <Header />
      <div className="w-full max-w-none mx-auto px-8 py-8 flex-1">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Professional Keyword Combiner Tool
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Generate thousands of keyword combinations for your SEO and PPC campaigns. 
            Built by McDougall Interactive - Digital Marketing Experts since 1995.
          </p>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <Badge variant="secondary" className="text-sm">
              <Search className="w-4 h-4 mr-2" />
              SEO Optimized
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Settings className="w-4 h-4 mr-2" />
              Advanced Filtering
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Professional Tool
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Keyword Research Section */}
          <KeywordResearch onAddKeywords={handleAddResearchKeywords} />

          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Build Your Keywords</h1>
            <p className="text-lg text-gray-600">Create multiple keyword lists and powerful combinations</p>
          </div>

          {/* Keyword Lists */}
          <div className="mb-8">
            <KeywordInputSection
              keywordGroups={keywordGroups}
              setKeywordGroups={setKeywordGroups}
            />
          </div>
          
          {/* Combination Settings */}
          <div className="mb-8">
            <CombinationSettingsComponent
              settings={combinationSettings}
              setSettings={setCombinationSettings}
              filterSettings={filterSettings}
              setFilterSettings={setFilterSettings}
              keywordGroups={keywordGroups}
              onGenerate={setResults}
            />
          </div>

          {/* Statistics Panel - Now Full Width Below Generate Button */}
          <div className="mb-8">
            <StatsPanel
              keywordGroups={keywordGroups}
              results={results}
            />
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="mt-8">
            <ResultsSection results={results} />
          </div>
        )}

      </div>

      {/* Template Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={setKeywordGroups}
      />

      {/* Progress Modal */}
      <Dialog open={isProgressModalOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" data-testid="text-progress-title">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Generating Keywords...
            </DialogTitle>
            <DialogDescription data-testid="text-progress-subtitle">
              Processing {progressState.expectedCombinations.toLocaleString()} combinations...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Progress value={progressState.progress} className="w-full" data-testid="progress-bar" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary" data-testid="text-progress-percentage">
                {progressState.progress}%
              </p>
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-progress-message">
                This may take a few moments. Please don't close this window.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
