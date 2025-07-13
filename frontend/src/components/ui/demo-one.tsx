import { Scene } from "./rubik-s-cube";

const DemoOne = () => {
  return (
    <div className="h-screen w-screen relative flex flex-col justify-center items-center">
      <div className="absolute inset-0">
        <Scene />
      </div>
      <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight mix-blend-difference text-white">
        ProjectBuzz
      </h1>
      <p className="text-lg md:text-xl text-white mix-blend-exclusion max-w-2xl px-6 leading-relaxed text-center">
         Digital Marketplace - Discover, Buy & Sell Amazing Projects
      </p>
    </div>
  );
};

export { DemoOne };
