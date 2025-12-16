import ClockCircle from '@/components/clocks/circle';
import ClockJump from '@/components/clocks/jump';
import ClockRoulette from '@/components/clocks/roulette';
import ClockSolar from '@/components/clocks/solar';
import ClockSteampunk from '@/components/clocks/steampunk';

export default function ClocksPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">时钟集合</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">圆形时钟</h2>
          <ClockCircle staticTime="10:10:30" />
        </div>

        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">跳跳时钟</h2>
          <ClockJump staticTime="10:10:30" />
        </div>

        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">轮盘时钟</h2>
          <ClockRoulette staticTime="10:10:30" />
        </div>

        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">太阳系时钟</h2>
          <ClockSolar staticTime="10:10:30" />
        </div>

        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">蒸汽朋克时钟</h2>
          <ClockSteampunk staticTime="10:10:30" />
        </div>
      </div>
    </div>
  );
}