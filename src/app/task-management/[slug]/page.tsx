import { TaskDetailPageClient } from "@/components/dashboard/TaskDetailPageClient";

type TaskDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TaskDetailPage({
  params,
}: TaskDetailPageProps) {
  const { slug } = await params;

  return <TaskDetailPageClient slug={slug} />;
}
