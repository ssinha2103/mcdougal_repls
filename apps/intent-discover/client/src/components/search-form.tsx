import { useState } from "react";
import { Search, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchFormProps {
  onSearch: (keyword: string) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSearch(keyword.trim());
    }
  };

  const handleClear = () => {
    setKeyword("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex w-full items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Enter a keyword (e.g., best running shoes)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={`pl-12 text-base ${keyword ? 'pr-12' : 'pr-4'}`}
            disabled={isLoading}
            data-testid="input-keyword"
            autoFocus
          />
          {keyword && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              data-testid="button-clear"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={!keyword.trim() || isLoading}
          data-testid="button-search"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>
      </div>
    </form>
  );
}
