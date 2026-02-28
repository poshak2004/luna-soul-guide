
import { Logo } from '@/components/Logo';
import { JournalEditor } from '@/components/journal/JournalEditor';
import { JournalList } from '@/components/journal/JournalList';
import { AIJournalPrompts } from '@/components/journal/AIJournalPrompts';
import { LunaCompanion } from '@/components/luna/LunaCompanion';
import { useJournal } from '@/hooks/useJournal';
import { useLuna } from '@/hooks/useLuna';
import { motion } from 'framer-motion';
import { PenLine } from 'lucide-react';
import { useState } from 'react';

const Journal = () => {
  const { entries, isLoading, refetch } = useJournal();
  const luna = useLuna();
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSave = () => {
    refetch();
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-calm p-6">
        <header className="max-w-6xl mx-auto mb-8">
          <Logo />
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="flex items-center gap-3">
              <PenLine className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-primary">Your Journal</h1>
            </div>
            <p className="text-muted-foreground mt-2">
              Express your thoughts and feelings in a safe space
            </p>
          </motion.div>
        </header>

        <main className="max-w-6xl mx-auto">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <AIJournalPrompts onSelectPrompt={setSelectedPrompt} />
              <JournalEditor onSave={handleSave} initialPrompt={selectedPrompt} />
            </div>
            <JournalList refresh={refreshKey} />
          </div>
        </main>

        {/* Luna Companion */}
        <LunaCompanion
          emotion={luna.emotion}
          message={luna.message}
          showMessage={luna.showMessage}
          onDismiss={luna.dismiss}
          level={luna.level}
        />
      </div>
    </>
  );
};

export default Journal;
