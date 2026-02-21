import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { analyzeLinkSchema, type AnalyzeLinkRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Search } from "lucide-react";

interface UrlInputFormProps {
  onSubmit: (data: AnalyzeLinkRequest) => void;
  isLoading: boolean;
}

export function UrlInputForm({ onSubmit, isLoading }: UrlInputFormProps) {
  const form = useForm<AnalyzeLinkRequest>({
    resolver: zodResolver(analyzeLinkSchema),
    defaultValues: {
      url: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter webpage URL (e.g., example.com)"
                    className="text-base flex-1"
                    disabled={isLoading}
                    data-testid="input-url"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    data-testid="button-analyze"
                    className="px-6"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
