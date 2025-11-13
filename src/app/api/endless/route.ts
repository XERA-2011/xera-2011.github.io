import { NextResponse } from 'next/server';
import { battleScenes } from '@/data/endless/endless';

// Battle scene response type
interface BattleSceneResponse {
  enemyName: string;
  successMessage: string;
  failMessage: string;
  description?: string;
}

export async function GET() {
  try {
    // Get random battle scene from endless data
    const sceneKeys = Object.keys(battleScenes);
    const randomKey = sceneKeys[Math.floor(Math.random() * sceneKeys.length)];
    const scene = battleScenes[randomKey];

    // Validate scene exists
    if (!scene) {
      console.error('Battle scene not found for key:', randomKey);
      return NextResponse.json(
        { error: 'Battle scene not found' },
        { status: 404 }
      );
    }

    // Return battle scene
    const response: BattleSceneResponse = {
      enemyName: scene.enemyName,
      successMessage: scene.successMessage,
      failMessage: scene.failMessage,
      description: scene.description,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating battle scene:', error);
    return NextResponse.json(
      { error: 'Battle system error' },
      { status: 500 }
    );
  }
}
