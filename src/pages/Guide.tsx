import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Heart, Sparkles, TrendingUp, Award, Music, MessageCircle, PenTool, Lightbulb, Zap, Target, CheckCircle2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { fadeIn, scaleIn } from '@/lib/motion';

const Guide = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: PenTool,
      title: 'Journaling',
      description: 'Express yourself freely and track your emotional journey',
      gradient: 'from-purple-400/20 to-pink-400/20'
    },
    {
      icon: Heart,
      title: 'Guided Exercises',
      description: 'Breathing, meditation, and grounding techniques',
      gradient: 'from-pink-400/20 to-rose-400/20'
    },
    {
      icon: Music,
      title: 'Sensory Healing',
      description: 'Therapeutic soundscapes and audio-reactive visuals',
      gradient: 'from-cyan-400/20 to-teal-400/20'
    },
    {
      icon: TrendingUp,
      title: 'Insights & Analytics',
      description: 'Understand patterns in your mood and wellness',
      gradient: 'from-emerald-400/20 to-green-400/20'
    },
    {
      icon: Award,
      title: 'Badges & Progress',
      description: 'Earn achievements as you grow and heal',
      gradient: 'from-amber-400/20 to-yellow-400/20'
    },
    {
      icon: MessageCircle,
      title: 'Chat with Luna',
      description: 'AI companion for support and reflection',
      gradient: 'from-violet-400/20 to-purple-400/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-mint/10 to-blush/10 pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          {...fadeIn}
        >
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Welcome to Emotional Reactive AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Your companion for calm, reflection, and emotional clarity. 
            A safe space to explore your inner world and nurture your mental wellbeing.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Exploring
          </Button>
        </motion.div>

        {/* About Section */}
        <motion.div
          className="mb-16"
          {...scaleIn}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 glass border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
              <h2 className="font-display text-3xl font-bold">What is Luna?</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Emotional Reactive AI is a gamified wellness platform designed to support your mental health journey.
              Through journaling, therapeutic exercises, sensory experiences, and AI-powered insights, 
              Luna helps you understand your emotions, build healthy habits, and find moments of peace 
              in your daily life. Every interaction earns you points, unlocks badges, and contributes 
              to your personal growth story.
            </p>
          </Card>
        </motion.div>

        {/* Detailed How to Use Instructions */}
        <motion.div
          className="mb-16"
          {...fadeIn}
          transition={{ delay: 0.25 }}
        >
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold mb-4">
              Your Journey to Wellness Starts Here
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Follow these steps to unlock the full potential of your emotional wellbeing companion
            </p>
          </div>

          <div className="space-y-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-8 glass border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 font-bold text-white text-2xl shadow-lg">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-bold mb-3 flex items-center gap-2">
                      <Heart className="w-6 h-6 text-primary" />
                      Create Your Account & Set Up Your Profile
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Start by signing up with your email address. We use industry-standard encryption to keep your data completely private and secure. No one else can access your personal journal entries, chat history, or wellness data.
                    </p>
                    <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-3">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm mb-1">Pro Tip:</p>
                          <p className="text-sm text-muted-foreground">
                            After signing up, take the interactive tour from Settings to learn where everything is located. It only takes 2 minutes!
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">🔒 Private & Secure</span>
                      <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">📧 Email Verification</span>
                      <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">⚡ Quick Setup</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 glass border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 font-bold text-white text-2xl shadow-lg">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-bold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-primary" />
                      Explore Your Dashboard
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Your Dashboard is your wellness command center. Here you'll see your current streak (consecutive days of activity), total points earned, recent activities, and quick shortcuts to all features. Make it a habit to check your dashboard daily!
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 mb-3">
                      <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Daily Streak Counter</p>
                          <p className="text-xs text-muted-foreground">Track consecutive active days</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Points Overview</p>
                          <p className="text-xs text-muted-foreground">See your total wellness score</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Recent Activity</p>
                          <p className="text-xs text-muted-foreground">View your latest interactions</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Quick Actions</p>
                          <p className="text-xs text-muted-foreground">Jump to any feature instantly</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-8 glass border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 font-bold text-white text-2xl shadow-lg">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-bold mb-3 flex items-center gap-2">
                      <MessageCircle className="w-6 h-6 text-primary" />
                      Chat with Luna - Your AI Companion
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Luna is your empathetic AI companion available 24/7. Share your thoughts, feelings, or concerns - there's no judgment here. Luna uses advanced AI to understand context and provide thoughtful, supportive responses. You can type or use voice input!
                    </p>
                    <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-lg p-4 mb-3">
                      <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4 text-violet-500" />
                        Smart Suggestions Based On:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                        <li>• Time of day (morning encouragement, evening reflection)</li>
                        <li>• Your current streak and progress</li>
                        <li>• Recent mood patterns from your journal</li>
                        <li>• Recommended exercises based on your state</li>
                      </ul>
                    </div>
                    <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Zap className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm mb-1">Quick Start:</p>
                          <p className="text-sm text-muted-foreground">
                            Click any suggestion button when you first open chat, or try: "I'm feeling anxious today" or "Help me reflect on my week"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-8 glass border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 font-bold text-white text-2xl shadow-lg">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-bold mb-3 flex items-center gap-2">
                      <PenTool className="w-6 h-6 text-primary" />
                      Journal Your Thoughts & Emotions
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Your journal is a private, encrypted space to express yourself freely. Write about your day, track your moods, or just let your thoughts flow. Each entry helps you understand emotional patterns over time and earns you 5 points!
                    </p>
                    <div className="grid md:grid-cols-3 gap-3 mb-3">
                      <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 p-3 rounded-lg border border-pink-500/30">
                        <p className="font-semibold text-sm mb-1">📝 Write Freely</p>
                        <p className="text-xs text-muted-foreground">No word limits or restrictions</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-3 rounded-lg border border-blue-500/30">
                        <p className="font-semibold text-sm mb-1">😊 Track Moods</p>
                        <p className="text-xs text-muted-foreground">6 mood options per entry</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-3 rounded-lg border border-green-500/30">
                        <p className="font-semibold text-sm mb-1">📊 See Patterns</p>
                        <p className="text-xs text-muted-foreground">Track emotional trends</p>
                      </div>
                    </div>
                    <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm mb-1">Journaling Tips:</p>
                          <p className="text-sm text-muted-foreground">
                            Try morning pages (write first thing after waking up) or evening reflection (review your day before bed). Consistency matters more than length!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Step 5 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-8 glass border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 font-bold text-white text-2xl shadow-lg">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-bold mb-3 flex items-center gap-2">
                      <Heart className="w-6 h-6 text-primary" />
                      Practice Guided Exercises
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Access a library of therapeutic exercises designed to help you manage stress, anxiety, and overwhelming emotions. Each exercise is guided, timed, and scientifically backed by cognitive behavioral therapy principles.
                    </p>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                          <span className="text-lg">🫁</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Breathing Exercises (10 pts)</p>
                          <p className="text-xs text-muted-foreground">Box breathing, 4-7-8 technique, and calming breath work. Perfect for anxiety relief in 2-5 minutes.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                          <span className="text-lg">🧘</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Meditation Sessions (15 pts)</p>
                          <p className="text-xs text-muted-foreground">Guided mindfulness meditation, body scan, and visualization exercises. 5-15 minute sessions.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                          <span className="text-lg">🌱</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Grounding Techniques (10 pts)</p>
                          <p className="text-xs text-muted-foreground">5-4-3-2-1 sensory awareness and other grounding methods for anxiety and panic attacks.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                          <span className="text-lg">💪</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Progressive Relaxation (20 pts)</p>
                          <p className="text-xs text-muted-foreground">Systematic muscle tension and release. Great for physical stress and sleep preparation.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Step 6 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-8 glass border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 font-bold text-white text-2xl shadow-lg">
                    6
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-bold mb-3 flex items-center gap-2">
                      <Music className="w-6 h-6 text-primary" />
                      Immerse in Sensory Healing
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Experience therapeutic soundscapes with stunning audio-reactive visuals. Each sound is designed for specific emotional states - sleep, focus, meditation, or relaxation. The visuals pulse and breathe with the audio frequency for a fully immersive experience.
                    </p>
                    <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/30 rounded-lg p-4 mb-3">
                      <p className="font-semibold text-sm mb-2">🎧 What You'll Experience:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Real-time audio waveform visualization</li>
                        <li>• Mood-adaptive gradient backgrounds (blue for calm, green for focus, etc.)</li>
                        <li>• Floating particles that react to sound amplitude</li>
                        <li>• Complete session earns you 5 points</li>
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full">💤 Sleep Sounds</span>
                      <span className="text-xs px-3 py-1 bg-green-500/10 text-green-500 rounded-full">🎯 Focus Music</span>
                      <span className="text-xs px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full">🧘 Meditation</span>
                      <span className="text-xs px-3 py-1 bg-cyan-500/10 text-cyan-500 rounded-full">🌊 Relaxation</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Step 7 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
            >
              <Card className="p-8 glass border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 font-bold text-white text-2xl shadow-lg">
                    7
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-bold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-primary" />
                      Track Your Wellness Analytics
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Visit your Insights page to view comprehensive analytics of your wellness journey. See mood trends over time, activity patterns, and how different exercises affect your emotional state. Understanding your patterns is key to lasting emotional health.
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 p-4 rounded-lg border border-violet-500/30">
                        <p className="font-semibold text-sm mb-2">📈 Mood Trends</p>
                        <p className="text-xs text-muted-foreground">Visualize how your emotional state changes over days, weeks, and months</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4 rounded-lg border border-blue-500/30">
                        <p className="font-semibold text-sm mb-2">⏰ Activity Patterns</p>
                        <p className="text-xs text-muted-foreground">See when you're most active and which exercises you prefer</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 rounded-lg border border-green-500/30">
                        <p className="font-semibold text-sm mb-2">🎯 Goal Progress</p>
                        <p className="text-xs text-muted-foreground">Track streaks, points milestones, and achievement unlocks</p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-4 rounded-lg border border-amber-500/30">
                        <p className="font-semibold text-sm mb-2">💡 AI Insights</p>
                        <p className="text-xs text-muted-foreground">Get personalized recommendations based on your data</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Step 8 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
            >
              <Card className="p-8 glass border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 font-bold text-white text-2xl shadow-lg">
                    8
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-bold mb-3 flex items-center gap-2">
                      <Award className="w-6 h-6 text-primary" />
                      Earn Badges & Climb the Leaderboard
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Every activity earns you points. Points unlock achievement badges and help you climb the anonymous leaderboard. Compete with other users (all usernames are anonymous) while celebrating your personal milestones!
                    </p>
                    <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-lg p-4 mb-3">
                      <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-amber-500" />
                        Ways to Earn Points:
                      </p>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">+5</span> Complete a journal entry
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">+10</span> Breathing exercise
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">+15</span> Meditation session
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">+20</span> Progressive relaxation
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">+5</span> Listen to full soundscape
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">+10</span> Daily streak bonus
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full">🏆 Top 10 Leaderboard</span>
                      <span className="text-xs px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full">🎖️ 15+ Unique Badges</span>
                      <span className="text-xs px-3 py-1 bg-green-500/10 text-green-500 rounded-full">🔥 Streak Tracking</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Quick Tips Section */}
          <motion.div
            className="mt-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 glass bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/30">
              <h3 className="font-display text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Pro Tips for Success
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">Build a Daily Habit</p>
                    <p className="text-xs text-muted-foreground">Even 5 minutes a day keeps your streak alive and builds consistency</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">Mix Different Activities</p>
                    <p className="text-xs text-muted-foreground">Combine journaling, exercises, and chat for maximum benefit</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">Review Your Insights Weekly</p>
                    <p className="text-xs text-muted-foreground">Understanding patterns helps you make better wellness decisions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">Be Honest in Your Journal</p>
                    <p className="text-xs text-muted-foreground">It's private and encrypted - authenticity leads to real insights</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-display text-3xl font-bold text-center mb-8">
            Everything You Need to Thrive
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className={`p-6 h-full glass border-primary/20 hover:border-primary/40 transition-all hover-lift bg-gradient-to-br ${feature.gradient}`}>
                  <feature.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Footer */}
        <motion.div
          className="text-center"
          {...scaleIn}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-8 glass border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
            <h2 className="font-display text-3xl font-bold mb-4">
              Ready to Begin?
            </h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Your journey to emotional wellbeing starts here. 
              Luna is with you every step of the way 🌸
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Begin Your Journey
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Guide;
