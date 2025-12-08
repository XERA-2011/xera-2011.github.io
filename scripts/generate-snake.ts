
import fs from 'fs';
import path from 'path';
import { fetchGitHubContributions } from '@/components/github/snake/contributions';
import { userContributionToGrid } from '@/lib/snake/utils';
import { getBestRoute } from '@/lib/snake/solver/getBestRoute';
import { getPathToPose } from '@/lib/snake/solver/getPathToPose';
import { createSvg } from '@/lib/snake/svg-creator/create-svg';
import { createSnakeFromCells } from '@/lib/snake/types/snake';
import { Color } from '@/lib/snake/types/grid';

// --- Configuration ---
const OUTPUT_DIR = path.join(process.cwd(), 'dist', 'snake');

// --- Types ---
type ThemeName = 'dark' | 'light';

const PALETTES = {
  light: {
    colorDots: {
      1: "#9be9a8",
      2: "#40c463",
      3: "#30a14e",
      4: "#216e39",
    } as Record<Color, string>,
    colorEmpty: "#ebedf0",
    colorDotBorder: "#1b1f230a",
    colorSnake: "purple",
    sizeCell: 16,
    sizeDot: 12,
    sizeDotBorderRadius: 2,
  },
  dark: {
    colorDots: {
      1: "#01311f",
      2: "#034525",
      3: "#0f6d31",
      4: "#00c647",
    } as Record<Color, string>,
    colorEmpty: "#161b22",
    colorDotBorder: "#1b1f230a",
    colorSnake: "purple",
    sizeCell: 16,
    sizeDot: 12,
    sizeDotBorderRadius: 2,
  }
};

async function generateSnake(username: string) {
  console.log(`Generating snake for ${username}...`);

  try {
    // Fetch GitHub contributions
    const contributions = await fetchGitHubContributions(username);

    // Convert to grid
    const grid = userContributionToGrid(contributions);

    // Initial snake position
    const snake = createSnakeFromCells([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ]);

    // Calculate best route
    const chain = getBestRoute(grid, snake)!;
    
    // Return to start (loop)
    const returnPath = getPathToPose(chain.slice(-1)[0], snake);
    if (returnPath) {
        chain.push(...returnPath);
    }

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Generate and save SVGs for both themes
    const themes: ThemeName[] = ['light', 'dark'];
    
    for (const theme of themes) {
      const options = {
          ...(theme === 'dark' ? PALETTES.dark : PALETTES.light),
      };

      const svg = createSvg(grid, contributions, chain, options, { stepDurationMs: 100 });
      const filename = theme === 'light' 
        ? 'light.svg' 
        : 'dark.svg';
      
      const filePath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(filePath, svg);
      console.log(`Generated ${filePath}`);
    }

    console.log('Done!');

  } catch (error) {
    console.error('Error generating snake:', error);
    process.exit(1);
  }
}

// Get username from args or env
const username = process.argv[2] || process.env.GITHUB_REPOSITORY_OWNER;

if (!username) {
  console.error('Please provide a username as an argument or set GITHUB_REPOSITORY_OWNER env var');
  process.exit(1);
}

generateSnake(username);
