// components/github/snake/types.ts
export type GitHubContributionDay = {
  x: number;
  y: number;
  date: string;
  count: number;
  level: number;
};

// GitHubContributionResponse 类型现在在 contributions.ts 中定义为 GraphQLResponse<GitHubContributionResponseData>
export type GitHubContributionResponseData = {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        weeks: {
          contributionDays: {
            contributionCount: number;
            contributionLevel: string;
            date: string;
            weekday: number;
          }[];
        }[];
      };
    };
  };
};