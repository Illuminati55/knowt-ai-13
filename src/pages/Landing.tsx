import { ArrowRight, Brain, Zap, Globe, FileText, Youtube, Linkedin, Star, CheckCircle, Sparkles, BookOpen, Search, TrendingUp, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Curator AI
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-smooth">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-smooth">How it Works</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-smooth">Pricing</a>
          </nav>
          <Link to="/auth">
            <Button className="gradient-primary text-primary-foreground">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 border-primary/20 text-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Knowledge Management
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Turn Any Content Into
              <span className="bg-gradient-to-r from-primary via-secondary to-primary-glow bg-clip-text text-transparent">
                {" "}Actionable Insights
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Stop drowning in information. Curator AI transforms articles, videos, and documents 
              into organized knowledge with AI-generated summaries, key takeaways, and smart insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/auth">
                <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
                  Start Organizing for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-primary/20 hover:border-primary">
                <Globe className="mr-2 h-5 w-5" />
                Try Demo Content
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto text-center">
              <div>
                <div className="text-2xl font-bold text-primary">10x</div>
                <div className="text-sm text-muted-foreground">Faster Research</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">AI-Powered</div>
                <div className="text-sm text-muted-foreground">Smart Insights</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Processing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Source Types */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Works with All Your Content Sources</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Paste any URL or upload documents. Our AI extracts insights from any format.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Globe, name: "Web Articles", desc: "Blog posts, news, research papers" },
              { icon: Youtube, name: "YouTube Videos", desc: "Transcripts and key moments" },
              { icon: Linkedin, name: "LinkedIn Posts", desc: "Professional insights and trends" },
              { icon: FileText, name: "Documents", desc: "PDFs, docs, and presentations" }
            ].map((source, index) => (
              <Card key={index} className="p-6 text-center border-card-border hover:shadow-medium transition-smooth">
                <source.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{source.name}</h3>
                <p className="text-sm text-muted-foreground">{source.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/20 text-primary">
              <Zap className="h-3 w-3 mr-1" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl font-bold mb-6">
              Everything You Need to Master Information Overload
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From content ingestion to actionable insights, we've built the complete knowledge management system.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Brain,
                title: "AI-Generated Summaries",
                description: "Get the essence of any content in seconds. Our AI reads, analyzes, and creates concise summaries that capture the key points.",
                features: ["Smart extraction", "Key quotes", "Main themes"]
              },
              {
                icon: Sparkles,
                title: "Actionable Insights",
                description: "Go beyond summaries. Get practical takeaways, recommendations, and next steps tailored to your needs.",
                features: ["Key takeaways", "Action items", "Follow-up suggestions"]
              },
              {
                icon: Search,
                title: "Smart Organization",
                description: "Automatic tagging, categorization, and intelligent search make finding information effortless.",
                features: ["Auto-tagging", "Smart collections", "Instant search"]
              },
              {
                icon: TrendingUp,
                title: "Pattern Recognition",
                description: "Discover connections across your knowledge base. Find trends, patterns, and related content automatically.",
                features: ["Content connections", "Trend analysis", "Insight patterns"]
              },
              {
                icon: Clock,
                title: "Real-time Processing",
                description: "Add content and get insights instantly. No waiting, no delays - just immediate, actionable knowledge.",
                features: ["Instant processing", "Live updates", "Background sync"]
              },
              {
                icon: Users,
                title: "Knowledge Sharing",
                description: "Build collections, share insights, and collaborate on knowledge building with your team.",
                features: ["Team collections", "Shared insights", "Export options"]
              }
            ].map((feature, index) => (
              <Card key={index} className="p-6 border-card-border hover:shadow-medium transition-smooth group">
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-smooth">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/20 text-primary">
              <BookOpen className="h-3 w-3 mr-1" />
              Simple Process
            </Badge>
            <h2 className="text-4xl font-bold mb-6">From Content Chaos to Organized Knowledge</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Three simple steps to transform any content into actionable insights and organized knowledge.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Add Content",
                  description: "Simply paste a URL or upload a document. Works with articles, videos, PDFs, and more.",
                  icon: Globe
                },
                {
                  step: "02", 
                  title: "AI Processing",
                  description: "Our AI reads, analyzes, and extracts key information, creating summaries and insights.",
                  icon: Brain
                },
                {
                  step: "03",
                  title: "Organized Knowledge", 
                  description: "Get searchable, tagged, and organized content with actionable takeaways ready to use.",
                  icon: Sparkles
                }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="h-16 w-16 rounded-full gradient-primary mx-auto flex items-center justify-center shadow-glow">
                      <step.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-secondary text-secondary-foreground text-sm font-bold flex items-center justify-center">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Perfect for Every Knowledge Worker</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Whether you're researching, learning, or staying informed, Curator AI adapts to your workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Researchers & Students",
                description: "Organize academic papers, extract key findings, and build comprehensive literature reviews.",
                use_cases: ["Literature reviews", "Research notes", "Citation management"]
              },
              {
                title: "Content Creators", 
                description: "Research topics faster, find angles, and generate content ideas from multiple sources.",
                use_cases: ["Topic research", "Content planning", "Trend analysis"]
              },
              {
                title: "Business Professionals",
                description: "Stay informed on industry trends, competitive intelligence, and market research.",
                use_cases: ["Market research", "Competitor analysis", "Industry reports"]
              },
              {
                title: "Consultants & Analysts",
                description: "Process client materials, extract insights, and create comprehensive reports efficiently.",
                use_cases: ["Client research", "Report building", "Data synthesis"]
              },
              {
                title: "Entrepreneurs",
                description: "Monitor trends, research opportunities, and stay ahead in your industry.",
                use_cases: ["Market trends", "Opportunity research", "Industry insights"]
              },
              {
                title: "Lifelong Learners",
                description: "Organize learning materials, track progress, and build personal knowledge bases.",
                use_cases: ["Course materials", "Skill building", "Knowledge tracking"]
              }
            ].map((useCase, index) => (
              <Card key={index} className="p-6 border-card-border hover:shadow-medium transition-smooth">
                <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">{useCase.description}</p>
                <ul className="space-y-2">
                  {useCase.use_cases.map((item, i) => (
                    <li key={i} className="flex items-center text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-primary mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-6 border-primary/20 text-primary">
              <Zap className="h-3 w-3 mr-1" />
              Get Started Today
            </Badge>
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Information Workflow?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of knowledge workers who've revolutionized how they process and organize information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/auth">
                <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • 7-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Curator AI
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-smooth">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-smooth">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-smooth">Support</a>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 Curator AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;