import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';

interface PolicySection {
  heading: string;
  body: string;
}

interface PolicyPageProps {
  title: string;
  subtitle: string;
  sections: PolicySection[];
  note?: string;
  onBack: () => void;
}

function PolicyPage({ title, subtitle, sections, note, onBack }: PolicyPageProps) {
  return (
    <div className="min-h-screen bg-bg px-5 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>
        <div className="card">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/90"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-bold text-text">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-muted">{subtitle}</p>
          <div className="space-y-5 text-sm leading-7 text-muted">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-semibold text-text">{section.heading}</h2>
                <p>{section.body}</p>
              </section>
            ))}
          </div>
          {note && <p className="mt-6 border-t border-border pt-5 text-xs text-muted">{note}</p>}
        </div>
      </div>
    </div>
  );
}

const DRAFT_NOTE =
  'This is a plain-language summary, not legal advice. The full text will be reviewed before public launch.';

export function PrivacyPage({ onBack }: { onBack: () => void }) {
  return (
    <PolicyPage
      title="Privacy notice"
      subtitle="How FoundStep handles your information."
      onBack={onBack}
      note={DRAFT_NOTE}
      sections={[
        {
          heading: 'What we collect',
          body: 'We collect your account details, business profile, daily entries, gate progress, and messages you choose to save in FoundStep.',
        },
        {
          heading: 'Why we use it',
          body: 'We use this information to show your dashboard, calculate your self-reported progress, and keep your founder workspace working for you.',
        },
        {
          heading: 'Your responsibility',
          body: 'Do not enter passwords, bank details, BVN, identity numbers, or other sensitive information into notes or messages. All numbers you enter are self-reported.',
        },
        {
          heading: 'Your choices',
          body: 'You can stop using FoundStep at any time. Features that need a future service connection will be marked Coming soon before they are available.',
        },
      ]}
    />
  );
}

export function TermsPage({ onBack }: { onBack: () => void }) {
  return (
    <PolicyPage
      title="Terms of use"
      subtitle="The rules for using FoundStep, provided by [COMPANY NAME]."
      onBack={onBack}
      note={DRAFT_NOTE}
      sections={[
        {
          heading: 'What FoundStep is',
          body: 'FoundStep is a tool that helps early founders set goals, log daily results, and track progress. It is not a bank, does not hold or move money, and does not promise funding.',
        },
        {
          heading: 'Self-reported numbers',
          body: 'Every number you enter is self-reported. FoundStep does not check or verify those numbers, and gate progress reflects what you have entered.',
        },
        {
          heading: 'Your account',
          body: 'You are responsible for keeping your password safe and for the accuracy of what you enter.',
        },
        {
          heading: 'Free pilot',
          body: 'FoundStep is free during the pilot. If fees are introduced later, we will tell you clearly in writing before they apply.',
        },
      ]}
    />
  );
}

export function IdeasAndDataPage({ onBack }: { onBack: () => void }) {
  return (
    <PolicyPage
      title="Your ideas and data"
      subtitle="What happens to the ideas and information you put into FoundStep."
      onBack={onBack}
      note={DRAFT_NOTE}
      sections={[
        {
          heading: 'Your ideas stay yours',
          body: 'The business ideas, customer notes and plans you write in FoundStep belong to you. FoundStep uses them to run your workspace and for no other purpose.',
        },
        {
          heading: 'Where your data is kept',
          body: 'Your information is stored in a secure database. Each founder can only see their own business, entries and messages.',
        },
        {
          heading: 'Leaving FoundStep',
          body: 'You can stop using FoundStep at any time. Ask us to delete your account and the information attached to it.',
        },
      ]}
    />
  );
}
