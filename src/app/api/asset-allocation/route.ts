import { NextResponse } from 'next/server';
import { CELEBRITY_HOLDINGS } from '@/data/asset-allocation/celebrity-holdings';

// GET 请求：根据 type 参数返回不同数据
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // 如果 type=celebrity，返回名人持仓数据
    if (type === 'celebrity') {
      // 如果提供了 id，返回单个名人持仓
      if (id) {
        const portfolio = CELEBRITY_HOLDINGS.find(p => p.id === id);
        
        if (!portfolio) {
          return NextResponse.json(
            { error: '未找到该名人持仓数据', code: 'NOT_FOUND' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: portfolio,
        });
      }

      // 否则返回所有名人持仓列表
      return NextResponse.json({
        success: true,
        data: CELEBRITY_HOLDINGS,
        total: CELEBRITY_HOLDINGS.length,
      });
    }

    // 默认返回空数据或其他业务逻辑
    return NextResponse.json({
      success: true,
      data: [],
      message: '请指定 type 参数',
    });
  } catch (error) {
    console.error('获取资产配置数据失败:', error);
    return NextResponse.json(
      { error: '服务器错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
