import { useEffect } from "react";
import { Plus, X, Wand2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type KeywordGroup } from "@shared/schema";

interface KeywordInputSectionProps {
  keywordGroups: KeywordGroup[];
  setKeywordGroups: (groups: KeywordGroup[]) => void;
}

const GROUP_COLORS = [
  { bg: "bg-blue-500", icon: "bg-blue-500", text: "text-white", letter: "A" },
  { bg: "bg-purple-500", icon: "bg-purple-500", text: "text-white", letter: "B" },
  { bg: "bg-orange-500", icon: "bg-orange-500", text: "text-white", letter: "C" },
  { bg: "bg-green-500", icon: "bg-green-500", text: "text-white", letter: "D" },
  { bg: "bg-pink-500", icon: "bg-pink-500", text: "text-white", letter: "E" },
];

// Define placeholder text for each column
const PLACEHOLDER_TEXTS = [
  "air conditioning\nheating repair\nHVAC installation\nfurnace maintenance\ncooling services\nduct cleaning", // Column A - Services
  "company\ncompanies\nservice\nservices", // Column B - Business Types
  "massachusetts\nnew hampshire\nmaine" // Column C - Locations
];

// Define example keywords that should trigger clearing (matches the placeholders)
const PLACEHOLDER_EXAMPLES = [
  ["air conditioning", "heating repair", "HVAC installation", "furnace maintenance", "cooling services", "duct cleaning"],
  ["company", "companies", "service", "services"],
  ["massachusetts", "new hampshire", "maine"]
];

export default function KeywordInputSection({ 
  keywordGroups, 
  setKeywordGroups
}: KeywordInputSectionProps) {
  
  const addKeywordGroup = () => {
    const newId = Date.now().toString();
    const colorIndex = keywordGroups.length % GROUP_COLORS.length;
    
    const newGroup: KeywordGroup = {
      id: newId,
      name: `List ${GROUP_COLORS[colorIndex].letter}`,
      keywords: [],
    };
    
    setKeywordGroups([...keywordGroups, newGroup]);
  };

  const removeKeywordGroup = (id: string) => {
    setKeywordGroups(keywordGroups.filter(group => group.id !== id));
  };

  const updateGroupName = (id: string, name: string) => {
    setKeywordGroups(keywordGroups.map(group => 
      group.id === id ? { ...group, name } : group
    ));
  };

  const handleFocus = (id: string, index: number) => {
    // Clear keywords only if they exactly match the placeholder examples
    const group = keywordGroups.find(g => g.id === id);
    if (group && index < PLACEHOLDER_EXAMPLES.length) {
      const placeholderKeywords = PLACEHOLDER_EXAMPLES[index];
      const currentKeywords = group.keywords.map(k => k.toLowerCase().trim());
      const placeholderLowercase = placeholderKeywords.map(k => k.toLowerCase());
      
      // Check if current keywords exactly match placeholder examples
      if (currentKeywords.length === placeholderLowercase.length &&
          currentKeywords.every(k => placeholderLowercase.includes(k))) {
        // Clear the keywords as they are just placeholder examples
        setKeywordGroups(keywordGroups.map(g => 
          g.id === id ? { ...g, keywords: [] } : g
        ));
      }
    }
  };

  const handleTextChange = (id: string, value: string) => {
    // Store the raw lines without filtering to preserve user input during typing
    // Empty lines and whitespace will be filtered when generating combinations
    const keywords = value.split('\n');
    
    setKeywordGroups(keywordGroups.map(group => 
      group.id === id ? { ...group, keywords } : group
    ));
  };

  // Initialize with 3 empty groups if not already present
  useEffect(() => {
    if (keywordGroups.length === 0) {
      const initialGroups: KeywordGroup[] = [
        {
          id: "1",
          name: "List A",
          keywords: []
        },
        {
          id: "2", 
          name: "List B",
          keywords: []
        },
        {
          id: "3",
          name: "List C", 
          keywords: []
        }
      ];
      setKeywordGroups(initialGroups);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }, (_, index) => {
          const group = keywordGroups[index] || {
            id: (index + 1).toString(),
            name: `List ${GROUP_COLORS[index].letter}`,
            keywords: []
          };
          const colorConfig = GROUP_COLORS[index];

          return (
            <Card key={group.id} className="backdrop-blur-xl bg-white/70 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${colorConfig.icon} rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg">{colorConfig.letter}</span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {group.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <textarea
                    value={group.keywords.join('\n')}
                    onChange={(e) => handleTextChange(group.id, e.target.value)}
                    onFocus={() => handleFocus(group.id, index)}
                    placeholder={index < PLACEHOLDER_TEXTS.length ? PLACEHOLDER_TEXTS[index] : `Add keywords (one per line)\nExample keyword 1\nExample keyword 2`}
                    style={{
                      width: '100%',
                      minHeight: '350px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      fontFamily: 'monospace',
                      fontSize: '16px',
                      resize: 'vertical',
                      outline: 'none',
                      backdropFilter: 'blur(10px)'
                    }}
                    rows={12}
                    data-testid={`textarea-group-${colorConfig.letter.toLowerCase()}`}
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {group.keywords.filter(k => k.trim().length > 0).length} keywords
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
}
