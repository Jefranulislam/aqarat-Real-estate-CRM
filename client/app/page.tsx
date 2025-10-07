import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, BarChart3, Users, Home, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">Fi</span>
            </div>
            <span className="text-xl font-bold">Aqarat</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6 text-balance">
              The Complete CRM for Real Estate Professionals
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Manage leads, properties, deals, and client relationships all in one powerful platform. Built for agents,
              brokers, and teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2">
                  Start free trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container px-4 py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lead Management</h3>
              <p className="text-sm text-muted-foreground">
                Capture, track, and convert leads with intelligent scoring and automation
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Property Listings</h3>
              <p className="text-sm text-muted-foreground">
                Manage your entire property portfolio with detailed listings and media
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Deal Pipeline</h3>
              <p className="text-sm text-muted-foreground">Track deals through every stage from lead to closing</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Get insights into your performance with comprehensive reporting
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Aqarat. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
