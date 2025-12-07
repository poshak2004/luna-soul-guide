import { motion } from "framer-motion";
import { Phone, MessageSquare, Heart, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLuna } from "@/hooks/useLuna";
import { LunaCompanion } from "@/components/luna/LunaCompanion";

const Crisis = () => {
  const resources = [
    {
      name: "National Suicide Prevention Lifeline",
      phone: "988",
      description: "24/7 crisis support. Call or text.",
      action: "Call 988"
    },
    {
      name: "Crisis Text Line",
      phone: "Text HOME to 741741",
      description: "Free 24/7 text support for people in crisis.",
      action: "Text Now"
    },
    {
      name: "SAMHSA National Helpline",
      phone: "1-800-662-4357",
      description: "Treatment referral and information service.",
      action: "Call Now"
    },
    {
      name: "Veterans Crisis Line",
      phone: "1-800-273-8255 (Press 1)",
      description: "24/7 support for veterans and their families.",
      action: "Call Now"
    }
  ];

  const luna = useLuna('crisis');

  return (
    <div className="min-h-screen pt-16 bg-gradient-calm">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Alert Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-destructive/10 border-destructive/30 p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-destructive flex-shrink-0" />
              <div>
                <h2 className="font-display text-xl font-bold text-destructive mb-2">
                  If you're in immediate danger
                </h2>
                <p className="text-foreground/80 mb-4">
                  Please call emergency services (911 in the US) or go to your nearest emergency room. 
                  Your safety is the top priority.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <Heart className="w-12 h-12 text-primary fill-primary mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold mb-2">You're Not Alone</h1>
          <p className="text-lg text-foreground/80">
            Help is available 24/7. These resources are here for you.
          </p>
        </motion.div>

        {/* Crisis Resources */}
        <div className="space-y-4 mb-12">
          {resources.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="glass p-6 hover:glow transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-semibold mb-2">
                      {resource.name}
                    </h3>
                    <p className="text-foreground/70 mb-3">{resource.description}</p>
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      {resource.phone.includes("Text") ? (
                        <MessageSquare className="w-5 h-5" />
                      ) : (
                        <Phone className="w-5 h-5" />
                      )}
                      <span className="text-lg">{resource.phone}</span>
                    </div>
                  </div>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
                    asChild
                  >
                    <a 
                      href={resource.phone.includes("Text") ? "sms:741741" : `tel:${resource.phone.replace(/[^0-9]/g, '')}`}
                    >
                      {resource.action}
                    </a>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="glass p-8 text-center">
            <h3 className="font-display text-2xl font-semibold mb-4">
              Other Ways to Get Support
            </h3>
            <div className="space-y-3 text-foreground/80">
              <p>
                • Reach out to a trusted friend, family member, or counselor
              </p>
              <p>
                • Contact your doctor or mental health professional
              </p>
              <p>
                • Visit your local emergency room or urgent care center
              </p>
              <p>
                • Call your health insurance provider for mental health services
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Reassurance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8"
        >
          <p className="text-muted-foreground italic">
            "Even the darkest night will end and the sun will rise." - Victor Hugo
          </p>
        </motion.div>

        {/* Luna Companion - Worried state for crisis support */}
        <LunaCompanion
          emotion={luna.emotion}
          message={luna.message}
          showMessage={luna.showMessage}
          onDismiss={luna.dismiss}
          level={luna.level}
        />
      </div>
    </div>
  );
};

export default Crisis;
