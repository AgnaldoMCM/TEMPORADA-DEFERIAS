
import Header from '@/components/landing-page/header';
import Hero from '@/components/landing-page/hero';
import Information from '@/components/landing-page/information';
import Footer from '@/components/landing-page/footer';
import VideoSection from '@/components/landing-page/video-section';
import Speakers from '@/components/landing-page/speakers';
import Faq from '@/components/landing-page/faq';
import SignUp from '@/components/landing-page/signup';
import PhotoGallery from '@/components/landing-page/photo-gallery';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <Information />
        <VideoSection />
        <Speakers />
        <PhotoGallery />
        <Faq />
        <SignUp />
      </main>
      <Footer />
    </div>
  );
}
// Trigger commit
