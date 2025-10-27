import { notFound } from 'next/navigation';
import { getPatchBySlug, getAllSlugs } from '@/data/patches/index';
import PatchNotesDetail from '@/components/PatchNotesDetail';
export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map(slug => ({
    slug: slug
  }));
}
export async function generateMetadata({
  params
}) {
  const patch = getPatchBySlug(params.slug);
  if (!patch) {
    return {
      title: 'Patch Not Found | LoL Stats Tracker'
    };
  }
  return {
    title: `${patch.title} | LoL Stats Tracker`,
    description: patch.summary,
    openGraph: {
      title: patch.title,
      description: patch.summary,
      images: patch.images && patch.images.length > 0 ? [patch.images[0]] : []
    }
  };
}
export default function PatchNotePage({
  params
}) {
  const patch = getPatchBySlug(params.slug);
  if (!patch) {
    notFound();
  }
  return <PatchNotesDetail patch={patch} />;
}