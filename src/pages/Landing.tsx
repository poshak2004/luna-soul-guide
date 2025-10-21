import { motion } from "framer-motion";
import { MessageCircle, BookHeart, BarChart3, Heart, Sparkles, Globe, Users, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax Effect */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-hero">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl animate-breathe" />
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <Heart className="w-20 h-20 text-primary fill-primary glow" />
                <Sparkles className="w-8 h-8 text-accent absolute -top-2 -right-2 animate-pulse-gentle" />
              </div>
            </motion.div>

            <motion.h1 
              className="font-display text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              You deserve to feel heard.
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-foreground/80 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Meet Luna, your empathetic AI companion. A safe space for your thoughts, 
              feelings, and journey toward emotional well-being.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <Link to="/chat">
                <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground glow">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Talk to Luna
                </Button>
              </Link>
              <Link to="/onboarding">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-primary/50 hover:bg-primary/10">
                  Start Your Journey
                </Button>
              </Link>
            </motion.div>

            <motion.p
              className="text-sm text-muted-foreground mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              Free to start. Always private. Available 24/7.
            </motion.p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-calm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Your Complete Wellness Companion
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Everything you need for emotional well-being, in one beautiful space
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: MessageCircle,
                title: "Chat with Luna",
                description: "24/7 empathetic AI companion who listens without judgment and helps you process emotions.",
                color: "text-primary",
                link: "/chat"
              },
              {
                icon: BookHeart,
                title: "Private Journal",
                description: "Write freely in your encrypted space. Luna helps you find patterns and insights in your thoughts.",
                color: "text-accent",
                link: "/journal"
              },
              {
                icon: BarChart3,
                title: "Mood Insights",
                description: "Track your emotional journey with beautiful visualizations and AI-powered trend analysis.",
                color: "text-secondary",
                link: "/dashboard"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Link to={feature.link}>
                  <Card className="p-8 glass hover:glow transition-all duration-300 group cursor-pointer h-full">
                    <feature.icon className={`w-12 h-12 ${feature.color} mb-4 group-hover:scale-110 transition-transform`} />
                    <h3 className="font-display text-2xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Therapy Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Understanding Emotional Well-being
            </h2>
            <div className="space-y-6 text-lg text-foreground/80 leading-relaxed text-left">
              <p>
                Emotional wellness isn't about being happy all the time. It's about understanding 
                your feelings, building resilience, and having tools to navigate life's challenges.
              </p>
              <p>
                Whether you're dealing with stress, anxiety, sadness, or just need someone to talk to, 
                Luna provides a judgment-free space where you can express yourself freely and find clarity.
              </p>
              <p>
                Through evidence-based approaches inspired by CBT and mindfulness, combined with 
                empathetic AI conversations, Lovable helps you develop emotional awareness and healthy 
                coping strategies.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SDG Impact Section */}
      <section className="py-24 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Globe className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Making a Global Impact
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Aligned with UN Sustainable Development Goals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Heart,
                sdg: "SDG 3",
                title: "Good Health & Well-being",
                description: "Promoting mental health awareness and early emotional support"
              },
              {
                icon: Users,
                sdg: "SDG 10",
                title: "Reduced Inequalities",
                description: "Accessible mental health care regardless of background or income"
              },
              {
                icon: Leaf,
                sdg: "SDG 12",
                title: "Responsible Consumption",
                description: "Sustainable digital practices and mindful technology use"
              }
            ].map((impact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 glass text-center h-full">
                  <impact.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                  <div className="text-sm font-semibold text-primary mb-2">{impact.sdg}</div>
                  <h3 className="font-display text-xl font-semibold mb-2">{impact.title}</h3>
                  <p className="text-sm text-foreground/70">{impact.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-calm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Your journey starts here
            </h2>
            <p className="text-xl text-foreground/80 mb-8">
              Take the first step toward emotional well-being. Luna is ready to listen.
            </p>
            <Link to="/onboarding">
              <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground glow">
                Begin Your Journey
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
