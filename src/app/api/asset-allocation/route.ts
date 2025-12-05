import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
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

    // 如果 type=user，返回用户的资产配置
    if (type === 'user') {
      const session = await auth();
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: '未登录', code: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }

      const assets = await prisma.assetAllocation.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'asc' },
      });

      return NextResponse.json({
        success: true,
        data: assets.map((asset: { id: string; name: string; amount: number }) => ({
          id: asset.id,
          name: asset.name,
          amount: asset.amount,
        })),
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

// POST 请求：保存用户的资产配置
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登录', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { assets } = body;

    if (!Array.isArray(assets)) {
      return NextResponse.json(
        { error: '无效的数据格式', code: 'INVALID_DATA' },
        { status: 400 }
      );
    }

    // 限制最多保存 15 条数据
    if (assets.length > 15) {
      return NextResponse.json(
        { error: '最多只能保存15条资产数据', code: 'LIMIT_EXCEEDED' },
        { status: 400 }
      );
    }

    // 使用事务：先删除旧数据，再插入新数据
    await prisma.$transaction(async (tx) => {
      // 删除用户的所有旧资产配置
      await tx.assetAllocation.deleteMany({
        where: { userId: session.user.id },
      });

      // 插入新的资产配置
      if (assets.length > 0) {
        await tx.assetAllocation.createMany({
          data: assets.map((asset: { name: string; amount: number }) => ({
            userId: session.user.id,
            name: asset.name,
            amount: asset.amount,
          })),
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: '保存成功',
    });
  } catch (error) {
    console.error('保存资产配置失败:', error);
    return NextResponse.json(
      { error: '服务器错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
