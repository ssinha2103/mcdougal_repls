import { type Heading } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface HeadingHierarchyProps {
  headings: Heading[];
}

const headingColors = {
  1: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  2: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  3: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  4: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  5: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  6: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export function HeadingHierarchy({ headings }: HeadingHierarchyProps) {
  if (headings.length === 0) {
    return (
      <div className="bg-card border border-card-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No headings found on this page</p>
      </div>
    );
  }

  const renderTreeLines = (index: number, level: number) => {
    const lines: JSX.Element[] = [];
    
    for (let i = 1; i < level; i++) {
      const nextHeadings = headings.slice(index + 1);
      const hasDescendantAtLevel = nextHeadings.some(h => h.level === i);
      
      if (hasDescendantAtLevel) {
        lines.push(
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-0.5 bg-border"
            style={{ left: `${(i - 1) * 32}px` }}
          />
        );
      }
    }
    
    if (level > 1) {
      lines.push(
        <div
          key="h-connector"
          className="absolute top-1/2 h-0.5 bg-border"
          style={{
            left: `${(level - 2) * 32}px`,
            width: '20px'
          }}
        />
      );
    }
    
    return lines;
  };

  return (
    <div className="bg-card border border-card-border rounded-lg p-8">
      <h2 className="text-2xl font-semibold mb-6" data-testid="heading-hierarchy">
        Heading Hierarchy
      </h2>

      <div className="space-y-0">
        {headings.map((heading, index) => {
          const indentLevel = heading.level - 1;

          return (
            <div
              key={index}
              className="relative"
              data-testid={`heading-item-${index}`}
            >
              <div
                className="flex items-start gap-3 py-3 relative"
                style={{ paddingLeft: `${indentLevel * 32}px` }}
              >
                {renderTreeLines(index, heading.level)}

                <Badge
                  variant="secondary"
                  className={`flex-shrink-0 ${
                    headingColors[heading.level as keyof typeof headingColors]
                  } font-mono text-xs px-2 py-1 relative z-10`}
                  data-testid={`badge-h${heading.level}`}
                >
                  H{heading.level}
                </Badge>

                <div className="flex-1 min-w-0 relative z-10">
                  <p
                    className={`${
                      heading.level === 1
                        ? "text-xl font-bold"
                        : heading.level <= 3
                        ? "text-lg font-semibold"
                        : "text-base font-medium"
                    } text-foreground break-words`}
                    data-testid={`text-heading-${index}`}
                  >
                    {heading.text || (
                      <span className="text-muted-foreground italic">(empty)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Position: {heading.position + 1}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
