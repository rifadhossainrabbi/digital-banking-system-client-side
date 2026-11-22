import BankingServices from '@/components/home/BankingServices';
import Banner from '@/components/home/Banner';
import Capabilities from '@/components/home/Capabilities';
import CTABanner from '@/components/home/CTABanner';
import InterfaceOverview from '@/components/home/InterfaceOverview';
import OnboardingFlow from '@/components/home/OnboardingFlow';
import SecuritySection from '@/components/home/SecuritySection';
import Stats from '@/components/home/Stats';

export default function Home() {
  return (
    <div className="w-full flex-1 bg-white font-sans dark:bg-slate-950">
      <Banner />
      <Stats />
      <Capabilities />
      <BankingServices />
      <SecuritySection />
      <OnboardingFlow />
      <InterfaceOverview />
      <CTABanner/>
    </div>
  );
}
