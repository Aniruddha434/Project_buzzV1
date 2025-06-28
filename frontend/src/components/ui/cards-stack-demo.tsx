import { ContainerScroll, CardSticky } from "./cards-stack"
import {
  Search,
  ShoppingCart,
  Download,
  Users,
  Code,
  Shield,
  Zap,
  Target,
  Heart,
  Award,
  Eye
} from "lucide-react"

const DEVELOPMENT_PROCESS = [
  {
    id: "process-1",
    title: "Discover Projects",
    description:
      "Browse through our curated collection of high-quality digital projects. Use advanced filters to find exactly what you need - from web applications to mobile apps, from beginner-friendly to enterprise-level solutions.",
    icon: <Search className="h-6 w-6" />,
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "process-2",
    title: "Secure Purchase",
    description:
      "Experience seamless and secure transactions with our integrated payment system. Your purchases are protected with enterprise-grade security, ensuring safe and reliable access to premium digital content.",
    icon: <ShoppingCart className="h-6 w-6" />,
    color: "from-green-500 to-green-600"
  },
  {
    id: "process-3",
    title: "Instant Access",
    description:
      "Get immediate access to your purchased projects with comprehensive documentation, source code, and installation guides. Download everything you need to get started right away.",
    icon: <Download className="h-6 w-6" />,
    color: "from-purple-500 to-purple-600"
  },
  {
    id: "process-4",
    title: "Join Community",
    description:
      "Connect with a thriving community of developers, share your own projects, and collaborate on innovative solutions. Build your reputation and grow your network in the ProjectBuzz ecosystem.",
    icon: <Users className="h-6 w-6" />,
    color: "from-orange-500 to-orange-600"
  },
]

const FEATURED_PROJECTS = [
  {
    id: "project-1",
    title: "E-Commerce Platform",
    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2340&auto=format&fit=crop",
    price: "₹2,999",
    rating: "4.9"
  },
  {
    id: "project-2",
    title: "Social Media Dashboard",
    technologies: ["Vue.js", "Express", "PostgreSQL", "Socket.io"],
    imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=2339&auto=format&fit=crop",
    price: "₹1,999",
    rating: "4.8"
  },
  {
    id: "project-3",
    title: "Project Management Tool",
    technologies: ["Angular", "Django", "Redis", "Docker"],
    imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=2339&auto=format&fit=crop",
    price: "₹3,499",
    rating: "4.9"
  },
]

const PLATFORM_ACHIEVEMENTS = [
  {
    id: "achievement-1",
    title: "500+",
    description: "Active Projects",
    icon: <Code className="h-8 w-8" />,
    bg: "rgb(59, 130, 246)", // Blue
  },
  {
    id: "achievement-2",
    title: "1000+",
    description: "Happy Developers",
    icon: <Users className="h-8 w-8" />,
    bg: "rgb(16, 185, 129)", // Green
  },
  {
    id: "achievement-3",
    title: "25+",
    description: "Countries Served",
    icon: <Target className="h-8 w-8" />,
    bg: "rgb(139, 92, 246)", // Purple
  },
  {
    id: "achievement-4",
    title: "98%",
    description: "Success Rate",
    icon: <Award className="h-8 w-8" />,
    bg: "rgb(245, 158, 11)", // Amber
  },
]

const DevelopmentProcess = () => {
  return (
    <div className="container min-h-svh place-content-center bg-background px-6 text-foreground xl:px-12">
      <div className="grid md:grid-cols-2 md:gap-8 xl:gap-12">
        <div className="left-0 top-0 md:sticky md:h-svh md:py-12">
          <h5 className="text-xs uppercase tracking-wide text-muted-foreground">How it works</h5>
          <h2 className="mb-6 mt-4 text-4xl font-bold tracking-tight">
            Your journey to{" "}
            <span className="text-primary">digital success</span> starts here
          </h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            From discovery to deployment, ProjectBuzz provides everything you need
            to find, purchase, and implement high-quality digital projects. Join
            thousands of developers who trust our platform for their project needs.
          </p>
        </div>
        <ContainerScroll className="min-h-[400vh] space-y-8 py-12">
          {DEVELOPMENT_PROCESS.map((phase, index) => (
            <CardSticky
              key={phase.id}
              index={index + 2}
              className="rounded-2xl border border-border bg-card p-8 shadow-md backdrop-blur-md"
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${phase.color} flex items-center justify-center text-white`}>
                  {phase.icon}
                </div>
                <h3 className="text-2xl font-bold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </h3>
              </div>
              <h2 className="mb-4 text-2xl font-bold tracking-tighter text-foreground">
                {phase.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">{phase.description}</p>
            </CardSticky>
          ))}
        </ContainerScroll>
      </div>
    </div>
  )
}

const FeaturedProjects = () => {
  return (
    <div className="container min-h-svh place-content-center bg-muted/30 p-12 text-foreground">
      <div className="text-center mb-12">
        <h5 className="text-xs uppercase tracking-wide text-muted-foreground">Featured Projects</h5>
        <h2 className="mb-4 mt-1 text-4xl font-bold tracking-tight">
          Discover <span className="text-primary">amazing projects</span>
        </h2>
        <p className="mx-auto max-w-prose text-sm text-muted-foreground">
          From e-commerce platforms to social media dashboards, explore our collection
          of premium digital projects built by talented developers worldwide.
        </p>
      </div>
      <ContainerScroll className="min-h-[500vh] py-12">
        {FEATURED_PROJECTS.map((project, index) => (
          <CardSticky
            key={project.id}
            index={index}
            className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg"
            incrementY={60}
            incrementZ={5}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold tracking-tighter text-foreground">
                  {project.title}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-semibold text-primary">{project.price}</span>
                  <span className="text-sm text-muted-foreground">• ⭐ {project.rating}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {project.technologies.map((tech) => (
                  <div
                    key={tech}
                    className="flex rounded-lg bg-primary/10 px-2 py-1"
                  >
                    <span className="text-xs tracking-tighter text-primary">
                      {tech}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <img
              className="size-full object-cover h-64"
              width="100%"
              height="256"
              src={project.imageUrl}
              alt={project.title}
            />
          </CardSticky>
        ))}
      </ContainerScroll>
    </div>
  )
}

const PlatformAchievements = () => {
  return (
    <div className="bg-background">
      <ContainerScroll className="min-h-[400vh] place-items-center space-y-8 p-12 text-center">
        {PLATFORM_ACHIEVEMENTS.map((achievement, index) => (
          <CardSticky
            key={achievement.id}
            incrementY={20}
            index={index + 2}
            className="flex h-72 w-[420px] flex-col place-content-center justify-evenly rounded-2xl border border-border p-8 shadow-lg"
            style={{
              rotate: (index + 2) * 2,
              background: achievement.bg,
              color: 'white'
            }}
          >
            <div className="flex justify-center mb-4">
              {achievement.icon}
            </div>
            <h1 className="text-6xl font-bold opacity-90 mb-4">
              {achievement.title}
            </h1>
            <h3 className="text-2xl font-semibold capitalize tracking-tight">
              {achievement.description}
            </h3>
          </CardSticky>
        ))}
      </ContainerScroll>
    </div>
  )
}

export { DevelopmentProcess, FeaturedProjects, PlatformAchievements }
