import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchRequestSchema, type SearchRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";

interface SearchFormProps {
  onSubmit: (data: SearchRequest) => void;
  isLoading?: boolean;
}

export function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  const form = useForm<SearchRequest>({
    resolver: zodResolver(searchRequestSchema),
    defaultValues: {
      keyword: "",
      location: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="keyword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Legal Practice Area</FormLabel>
              <FormControl>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    placeholder="e.g., divorce lawyer, personal injury attorney"
                    className="pl-10"
                    data-testid="input-keyword"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Location</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    placeholder="e.g., New York, NY or 10001"
                    className="pl-10"
                    data-testid="input-location"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold"
          disabled={isLoading}
          data-testid="button-analyze"
        >
          {isLoading ? "Analyzing..." : "Analyze Competition"}
        </Button>
      </form>
    </Form>
  );
}
