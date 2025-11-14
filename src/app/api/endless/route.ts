import { NextResponse } from 'next/server';
import { battleScenes } from '@/data/endless/endless';

// 战斗场景响应类型
interface BattleSceneResponse {
  enemyName: string;
  successMessage: string;
  failMessage: string;
  description?: string;
}

export async function GET() {
  try {
    // 从无尽模式数据中获取随机战斗场景
    const sceneKeys = Object.keys(battleScenes);
    const randomKey = sceneKeys[Math.floor(Math.random() * sceneKeys.length)];
    const scene = battleScenes[randomKey];

    // 验证场景是否存在
    if (!scene) {
      console.error('Battle scene not found for key:', randomKey);
      return NextResponse.json(
        { error: 'Battle scene not found' },
        { status: 404 }
      );
    }

    // 返回战斗场景
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
