import { useState } from "react";
import { Wand2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type KeywordGroup, type CombinationSettings, type FilterSettings, type GenerateKeywordsResponse } from "@shared/schema";

interface CombinationSettingsProps {
  settings: CombinationSettings;
  setSettings: (settings: CombinationSettings) => void;
  filterSettings: FilterSettings;
  setFilterSettings: (settings: FilterSettings) => void;
  keywordGroups: KeywordGroup[];
  onGenerate: (results: GenerateKeywordsResponse) => void;
}

export default function CombinationSettings({
  settings,
  setSettings,
  filterSettings,
  setFilterSettings,
  keywordGroups,
  onGenerate,
}: CombinationSettingsProps) {
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate-keywords", {
        groups: keywordGroups,
        settings,
        filters: filterSettings,
      });
      return response.json();
    },
    onSuccess: (data: GenerateKeywordsResponse) => {
      onGenerate(data);
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

  const handleGenerate = () => {
    const hasAnyKeyword = keywordGroups.some(group =>
      group.keywords.some(keyword => keyword.trim().length > 0)
    );
    if (!hasAnyKeyword) {
      toast({
        title: "No Keywords",
        description: "Please add some keywords to generate combinations",
        variant: "destructive",
      });
      return;
    }
    
    generateMutation.mutate();
  };

  const getMatchTypePreview = () => {
    const sample = "black running shoes for work";
    switch (settings.matchType) {
      case 'phrase':
        return `"${sample}"`;
      case 'exact':
        return `[${sample}]`;
      case 'modified':
        return sample.split(' ').map(word => ['for'].includes(word) ? word : `+${word}`).join(' ');
      default:
        return sample;
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/70 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold">Combination Settings</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Match Type Format */}
        <div>
          <Label className="text-sm font-semibold mb-4 block">Match Type Format</Label>
          <Select value={settings.matchType} onValueChange={(value: any) => setSettings({ ...settings, matchType: value })}>
            <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30 focus:border-blue-400">
              <SelectValue placeholder="Select match type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="broad">Broad Match</SelectItem>
              <SelectItem value="phrase">Phrase Match</SelectItem>
              <SelectItem value="exact">Exact Match</SelectItem>
              <SelectItem value="modified">Modified Broad</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="mt-3 p-3 bg-blue-50/50 rounded-lg">
            <div className="text-xs text-gray-600">Preview: <span className="font-mono">{getMatchTypePreview()}</span></div>
          </div>
        </div>

        {/* Separator Settings */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Word Separator</Label>
          <Select value={settings.separator} onValueChange={(value: any) => setSettings({ ...settings, separator: value })}>
            <SelectTrigger className="backdrop-blur-sm bg-white/50 border-white/30 focus:border-blue-400">
              <SelectValue placeholder="Select separator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="space">Space ( )</SelectItem>
              <SelectItem value="dash">Dash (-)</SelectItem>
              <SelectItem value="underscore">Underscore (_)</SelectItem>
              <SelectItem value="none">No Separator</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          
          {settings.separator === 'custom' && (
            <Input
              placeholder="Enter custom separator"
              value={settings.customSeparator || ''}
              onChange={(e) => setSettings({ ...settings, customSeparator: e.target.value })}
              className="mt-2 backdrop-blur-sm bg-white/50 border-white/30 focus:border-blue-400"
            />
          )}
        </div>

        {/* Options */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Options</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeOriginal"
                checked={settings.includeOriginal || false}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, includeOriginal: !!checked })
                }
                data-testid="checkbox-include-original"
              />
              <Label htmlFor="includeOriginal" className="text-sm font-normal cursor-pointer">
                Include original keywords
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowercaseOutput"
                checked={settings.lowercaseOutput || false}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, lowercaseOutput: !!checked })
                }
                data-testid="checkbox-lowercase-output"
              />
              <Label htmlFor="lowercaseOutput" className="text-sm font-normal cursor-pointer">
                Lowercase output
              </Label>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-4 border-t border-white/20">
          <Button 
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
            size="lg"
          >
            {generateMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Generate Keywords
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
