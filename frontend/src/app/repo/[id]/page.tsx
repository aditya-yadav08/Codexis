export default function RepoPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
      <p className="text-sm">Repository view coming soon.</p>
      <p className="text-xs opacity-60">ID: {params.id}</p>
    </div>
  );
}
