import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TechMarquee from '@/components/TechMarquee';
import Stats from '@/components/Stats';
import Services from '@/components/Services';
import Team from '@/components/Team';
import Process from '@/components/Process';
import WhyUs from '@/components/WhyUs';
import OrderForm from '@/components/OrderForm';
import Footer from '@/components/Footer';
import MobileCta from '@/components/MobileCta';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TechMarquee />
        <Stats />
        <Services />
        <Team />
        <Process />
        <WhyUs />
        <OrderForm />
      </main>
      <Footer />
      <MobileCta />
      <WhatsAppButton />
    </>
  );
}
