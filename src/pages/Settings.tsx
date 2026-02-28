import { Logo } from '@/components/Logo';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { motion } from 'framer-motion';

const Settings = () => (
  <div className="min-h-screen bg-gradient-calm p-6">
    <header className="max-w-4xl mx-auto mb-8">
      <Logo />
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold text-primary mt-6">Settings & Preferences</h1>
        <p className="text-muted-foreground mt-2">Customize your Luna experience</p>
      </motion.div>
    </header>

    <main className="max-w-4xl mx-auto">
      <SettingsPanel />
    </main>
  </div>
);

export default Settings;
