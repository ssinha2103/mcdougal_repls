import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MessageSquare, ThumbsUp, TrendingUp, Video, Tag } from "lucide-react";
import type { VideoResult } from "@shared/schema";

interface MetricsDashboardProps {
  videos: VideoResult[];
}

export function MetricsDashboard({ videos }: MetricsDashboardProps) {
  const totalViews = videos.reduce((sum, video) => sum + parseInt(video.viewCount || "0"), 0);
  const totalComments = videos.reduce((sum, video) => sum + parseInt(video.commentCount || "0"), 0);
  const totalLikes = videos.reduce((sum, video) => sum + parseInt(video.likeCount || "0"), 0);
  
  const avgViews = videos.length > 0 ? Math.floor(totalViews / videos.length) : 0;
  const avgComments = videos.length > 0 ? Math.floor(totalComments / videos.length) : 0;
  const avgEngagement = totalViews > 0 ? ((totalComments + totalLikes) / totalViews * 100).toFixed(2) : "0";

  const allTags = videos.flatMap(v => v.tags || []);
  const tagFrequency = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topTags = Object.entries(tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Video className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Videos</span>
            </div>
            <div className="text-2xl font-bold" data-testid="metric-video-count">{videos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Avg Views</span>
            </div>
            <div className="text-2xl font-bold" data-testid="metric-avg-views">{formatNumber(avgViews)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Avg Comments</span>
            </div>
            <div className="text-2xl font-bold" data-testid="metric-avg-comments">{formatNumber(avgComments)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Engagement</span>
            </div>
            <div className="text-2xl font-bold" data-testid="metric-engagement">{avgEngagement}%</div>
          </CardContent>
        </Card>
      </div>

      {topTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Top Trending Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTags.map(({ tag, count }) => {
                const percentage = (count / videos.length) * 100;
                return (
                  <div key={tag} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-mono text-sm truncate max-w-[200px]" data-testid={`tag-${tag}`}>{tag}</span>
                      <span className="text-muted-foreground">{count} videos ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            Top Performing Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {videos
              .slice()
              .sort((a, b) => parseInt(b.viewCount || "0") - parseInt(a.viewCount || "0"))
              .slice(0, 5)
              .map((video, idx) => (
                <div key={video.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className="text-lg font-bold text-muted-foreground w-6">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1" data-testid={`top-video-title-${idx}`}>
                      {video.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{video.channelTitle}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {formatNumber(parseInt(video.viewCount || "0"))}
                      </span>
                      {video.commentCount && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {formatNumber(parseInt(video.commentCount))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
