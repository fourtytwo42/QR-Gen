import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { SiteShell } from '@/components/layout/SiteShell';
import { EditorDashboard } from '@/components/editor/EditorDashboard';
import { getMockEditorRecord } from '@/lib/mockData';

type Props = {
  params: { token: string };
};

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: `Editor · ${params.token}`,
  };
}

export default function EditorPage({ params }: Props) {
  if (!params.token) {
    notFound();
  }

  const record = getMockEditorRecord(params.token);

  return (
    <SiteShell>
      <EditorDashboard record={record} />
    </SiteShell>
  );
}
