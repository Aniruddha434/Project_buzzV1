import React from "react";
import { PinContainer } from "./3d-pin";
import { Code, Users, Zap, Star, TrendingUp, Shield } from "lucide-react";

export function AnimatedPinDemo() {
  return (
    <div className="h-[40rem] w-full flex items-center justify-center bg-background">
      <PinContainer title="Explore ProjectBuzz" href="/projects">
        <div className="flex flex-col p-4 tracking-tight text-slate-100/50 w-[20rem] h-[20rem] bg-gradient-to-b from-slate-800/50 to-slate-800/0 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-green-500 animate-pulse" />
            <div className="text-xs text-slate-400">Live Platform</div>
          </div>

          {/* Content */}
          <div className="flex-1 mt-4 space-y-4">
            <div className="text-2xl font-bold text-slate-100">
              ProjectBuzz
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-sky-400">500+</div>
                <div className="text-xs text-slate-400">Projects</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-emerald-400">99%</div>
                <div className="text-xs text-slate-400">Satisfaction</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Code className="w-3 h-3 text-blue-400" />
                <span>Digital Marketplace</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Users className="w-3 h-3 text-purple-400" />
                <span>Developer Community</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>Instant Downloads</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end">
              <div className="text-xs text-slate-400">
                Join thousands of developers
              </div>
              <div className="text-sky-400 text-sm font-medium">
                Explore →
              </div>
            </div>
          </div>
        </div>
      </PinContainer>
    </div>
  );
}

// Alternative ProjectBuzz-themed pins for different sections
export function ProjectShowcasePin() {
  return (
    <PinContainer title="Browse Projects" href="/projects">
      <div className="flex flex-col p-4 tracking-tight text-slate-100/50 w-[20rem] h-[20rem] bg-gradient-to-b from-blue-900/30 to-purple-900/30 backdrop-blur-sm border border-blue-500/30 rounded-2xl">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <div className="text-xs text-slate-400">Featured Projects</div>
        </div>

        <div className="flex-1 mt-4 space-y-4">
          <div className="text-2xl font-bold text-slate-100">
            Premium Code
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-blue-400">React</div>
              <div className="text-xs text-slate-400">Frontend</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-purple-400">Node</div>
              <div className="text-xs text-slate-400">Backend</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Shield className="w-3 h-3 text-green-400" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Quality Assured</span>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="text-xs text-slate-400">
              Ready-to-use solutions
            </div>
            <div className="text-blue-400 text-sm font-medium">
              Browse →
            </div>
          </div>
        </div>
      </div>
    </PinContainer>
  );
}

export function CommunityPin() {
  return (
    <PinContainer title="Join Community" href="/about">
      <div className="flex flex-col p-4 tracking-tight text-slate-100/50 w-[20rem] h-[20rem] bg-gradient-to-b from-emerald-900/30 to-teal-900/30 backdrop-blur-sm border border-emerald-500/30 rounded-2xl">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <div className="text-xs text-slate-400">Active Community</div>
        </div>

        <div className="flex-1 mt-4 space-y-4">
          <div className="text-2xl font-bold text-slate-100">
            Connect & Share
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-emerald-400">1K+</div>
              <div className="text-xs text-slate-400">Developers</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-teal-400">24/7</div>
              <div className="text-xs text-slate-400">Support</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Code className="w-3 h-3 text-blue-400" />
              <span>Code Reviews</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Star className="w-3 h-3 text-yellow-400" />
              <span>Best Practices</span>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="text-xs text-slate-400">
              Learn and grow together
            </div>
            <div className="text-emerald-400 text-sm font-medium">
              Join →
            </div>
          </div>
        </div>
      </div>
    </PinContainer>
  );
}
