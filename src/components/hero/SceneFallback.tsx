export function SceneFallback() {
  return (
    <div className="absolute inset-0 image-surface">
      <div className="absolute inset-x-[8%] bottom-[12%] top-[18%] border border-[#e7e3e0]/10 bg-[#2f2924]/45 shadow-2xl">
        <div className="absolute bottom-0 left-0 h-[34%] w-full bg-[#756a61]/30" />
        <div className="absolute right-[10%] top-[18%] h-[28%] w-[22%] bg-[#e7e3e0]/10" />
        <div className="absolute bottom-[18%] left-[22%] h-[18%] w-[34%] bg-[#85786f]/60" />
        <div className="absolute bottom-[16%] right-[18%] h-[24%] w-[15%] bg-[#171514]" />
      </div>
      <div className="absolute left-5 top-24 text-sm text-[#cbc9c8] md:left-10">Загрузка 3D-сцены...</div>
    </div>
  );
}
