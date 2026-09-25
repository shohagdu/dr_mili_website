import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FooterVideos } from '@/components/FooterVideos';
import { PhysicianSchema } from '@/components/seo/PhysicianSchema';
import { cms, CONTENT_TYPE } from '@/lib/cms';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [doctor, videos] = await Promise.all([
    cms.getDoctor(),
    cms.getContent(CONTENT_TYPE.VIDEO),
  ]);

  return (
    <>
      <PhysicianSchema doctor={doctor} />
      <Header doctor={doctor} />
      <main className="flex-1 relative z-10">{children}</main>
      <FooterVideos videos={videos} />
      <Footer doctor={doctor} />
    </>
  );
}
