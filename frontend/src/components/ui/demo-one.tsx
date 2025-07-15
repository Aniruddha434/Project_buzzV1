import { Scene } from "./rubik-s-cube";

const DemoOne = () => {
  return (
    <div className="h-screen w-screen relative flex flex-col justify-center items-center">
      <div className="absolute inset-0" aria-hidden="true">
        <Scene />
      </div>
      <div className="relative z-10 text-center">
        <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight mix-blend-difference text-white">
          ProjectBuzz
        </h1>
        <p className="text-lg md:text-xl text-white mix-blend-exclusion max-w-2xl px-6 leading-relaxed">
          Digital Marketplace - Discover, Buy & Sell Amazing Programming Projects
        </p>
        <div className="mt-8 text-sm text-white/70 max-w-3xl px-6">
          <p>
            The premier marketplace for developers to buy ready-made projects, sell coding solutions, and discover innovative programming projects. Join thousands of developers worldwide.
          </p>
        </div>
      </div>
    </div>
  );
};

export { DemoOne };
