import { useState } from "react";
import { Search, Plus, Loader2, Filter } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: number;
  cpc: number;
}

interface KeywordResearchProps {
  onAddKeywords: (keywords: string[], targetColumn: string) => void;
}

export default function KeywordResearch({ onAddKeywords }: KeywordResearchProps) {
  const [seedKeyword, setSeedKeyword] = useState("");
  const [keywordResults, setKeywordResults] = useState<KeywordData[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [targetColumn, setTargetColumn] = useState("A");
  const [filterText, setFilterText] = useState("");
  const [minVolume, setMinVolume] = useState("");
  const [maxVolume, setMaxVolume] = useState("");
  const [maxCompetition, setMaxCompetition] = useState("");
  const [maxCpc, setMaxCpc] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const researchMutation = useMutation({
    mutationFn: async (keyword: string) => {
      const response = await apiRequest("POST", "/api/keyword-research", {
        seedKeyword: keyword
      });
      return response.json();
    },
    onSuccess: (data: { keywords: KeywordData[] }) => {
      setKeywordResults(data.keywords || []);
      setSelectedKeywords(new Set());
      setShowFilters(false);
      setFilterText("");
      setMinVolume("");
      setMaxVolume("");
      setMaxCompetition("");
      setMaxCpc("");
      toast({
        title: "Keyword Research Complete",
        description: `Found ${data.keywords?.length || 0} related keywords`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Research Failed",
        description: error.message || "Failed to fetch keyword data",
        variant: "destructive",
      });
    },
  });

  const handleResearch = () => {
    if (!seedKeyword.trim()) {
      toast({
        title: "Enter Seed Keyword",
        description: "Please enter a keyword to research",
        variant: "destructive",
      });
      return;
    }
    researchMutation.mutate(seedKeyword);
  };

  const toggleKeywordSelection = (keyword: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedKeywords(newSelected);
  };

  // Filter the results based on filter criteria
  const filteredResults = keywordResults.filter(result => {
    // Text filter
    if (filterText && !result.keyword.toLowerCase().includes(filterText.toLowerCase())) {
      return false;
    }
    
    // Volume filters
    if (minVolume && result.searchVolume < parseInt(minVolume)) {
      return false;
    }
    if (maxVolume && result.searchVolume > parseInt(maxVolume)) {
      return false;
    }
    
    // Competition filter
    if (maxCompetition) {
      const comp = typeof result.competition === 'number' ? result.competition : parseFloat(result.competition) || 0;
      if (comp > parseFloat(maxCompetition)) {
        return false;
      }
    }
    
    // CPC filter
    if (maxCpc) {
      const cpc = typeof result.cpc === 'number' ? result.cpc : parseFloat(result.cpc) || 0;
      if (cpc > parseFloat(maxCpc)) {
        return false;
      }
    }
    
    return true;
  });

  const handleAddSelected = () => {
    if (selectedKeywords.size === 0) {
      toast({
        title: "No Keywords Selected",
        description: "Please select keywords to add",
        variant: "destructive",
      });
      return;
    }
    
    onAddKeywords(Array.from(selectedKeywords), targetColumn);
    setSelectedKeywords(new Set());
    toast({
      title: "Keywords Added",
      description: `Added ${selectedKeywords.size} keywords to List ${targetColumn}`,
    });
  };

  return (
    <Card className="backdrop-blur-xl bg-white/70 shadow-lg border border-white/20 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Keyword Research
        </CardTitle>
        <p className="text-sm text-gray-600">
          Enter a seed keyword to discover related keywords with search volume data
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter seed keyword (e.g., air conditioning service)"
            value={seedKeyword}
            onChange={(e) => setSeedKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
            className="backdrop-blur-sm bg-white/50 border-white/30 focus:border-blue-400"
            data-testid="input-seed-keyword"
          />
          <Button 
            onClick={handleResearch} 
            disabled={researchMutation.isPending}
            data-testid="button-research"
          >
            {researchMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {keywordResults.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedKeywords.size === filteredResults.length && filteredResults.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // Select all filtered results
                      setSelectedKeywords(new Set(filteredResults.map(r => r.keyword)));
                    } else {
                      // Deselect all
                      setSelectedKeywords(new Set());
                    }
                  }}
                  data-testid="checkbox-select-all"
                />
                <p className="text-sm text-gray-600">
                  {selectedKeywords.size === filteredResults.length && filteredResults.length > 0 ? 'All selected' : `${filteredResults.length} keywords shown • ${selectedKeywords.size} selected`}
                </p>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Filters
                </Button>
              </div>
            </div>
            
            {/* Filter Section */}
            {showFilters && (
              <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="filter-text" className="text-xs">Keyword Contains</Label>
                    <Input
                      id="filter-text"
                      type="text"
                      placeholder="Filter keywords..."
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="min-vol" className="text-xs">Min Volume</Label>
                      <Input
                        id="min-vol"
                        type="number"
                        placeholder="0"
                        value={minVolume}
                        onChange={(e) => setMinVolume(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-vol" className="text-xs">Max Volume</Label>
                      <Input
                        id="max-vol"
                        type="number"
                        placeholder="∞"
                        value={maxVolume}
                        onChange={(e) => setMaxVolume(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="max-comp" className="text-xs">Max Competition</Label>
                      <Input
                        id="max-comp"
                        type="number"
                        step="0.1"
                        placeholder="1.0"
                        value={maxCompetition}
                        onChange={(e) => setMaxCompetition(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-cpc" className="text-xs">Max CPC</Label>
                      <Input
                        id="max-cpc"
                        type="number"
                        step="0.01"
                        placeholder="$∞"
                        value={maxCpc}
                        onChange={(e) => setMaxCpc(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
                {(filterText || minVolume || maxVolume || maxCompetition || maxCpc) && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <p className="text-xs text-gray-600">
                      Showing {filteredResults.length} of {keywordResults.length} keywords
                    </p>
                    <Button
                      onClick={() => {
                        setFilterText("");
                        setMinVolume("");
                        setMaxVolume("");
                        setMaxCompetition("");
                        setMaxCpc("");
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/30 rounded-lg border border-white/20"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedKeywords.has(result.keyword)}
                      onCheckedChange={() => toggleKeywordSelection(result.keyword)}
                      data-testid={`checkbox-keyword-${index}`}
                    />
                    <span className="font-medium">{result.keyword}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {(result.searchVolume || 0).toLocaleString()} vol
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {typeof result.competition === 'number' ? result.competition.toFixed(1) : result.competition || 'N/A'} comp
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      ${typeof result.cpc === 'number' ? result.cpc.toFixed(2) : result.cpc || '0.00'} CPC
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add Selected Button */}
            <div className="flex flex-col items-center gap-3 pt-3 border-t border-white/20">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-gray-700">Add to:</Label>
                <Select value={targetColumn} onValueChange={setTargetColumn}>
                  <SelectTrigger className="w-24 h-8 bg-white/80 border-white/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">List A</SelectItem>
                    <SelectItem value="B">List B</SelectItem>
                    <SelectItem value="C">List C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddSelected}
                disabled={selectedKeywords.size === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed"
                data-testid="button-add-selected"
              >
                <Plus className="h-4 w-4 mr-2" />
                {selectedKeywords.size > 0 
                  ? `Add ${selectedKeywords.size} Selected Keyword${selectedKeywords.size > 1 ? 's' : ''} to List ${targetColumn}`
                  : `Add Selected Keywords to List ${targetColumn}`
                }
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}