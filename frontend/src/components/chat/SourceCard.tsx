import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import { FileCode2 } from "lucide-react";

export default function SourceCard({ source }: any) {
  const highlighted = Prism.highlight(
    source.snippet || "",
    Prism.languages.javascript,
    "javascript"
  );

  // Extract just the filename from the path for display
  const fileName = source.file?.split("/").pop() ?? source.file ?? "unknown";
  const filePath = source.file ?? "";

  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
      {/* File header */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-white/8 bg-white/3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-5 rounded-md bg-accent-primary/15 border border-accent-primary/20 flex items-center justify-center shrink-0">
            <FileCode2 className="size-3 text-accent-primary" />
          </div>
          <span className="text-xs font-medium text-foreground/90 truncate" title={filePath}>
            {fileName}
          </span>
          {filePath !== fileName && (
            <span className="text-[10px] text-muted-foreground/60 truncate hidden sm:block" title={filePath}>
              {filePath}
            </span>
          )}
        </div>

        <span className="shrink-0 text-[10px] font-medium text-muted-foreground bg-white/6 border border-white/10 rounded-full px-2 py-0.5">
          L{source.start_line}–{source.end_line}
        </span>
      </div>

      {/* Code block */}
      <div className="bg-[oklch(0.11_0.015_265)] overflow-hidden">
        <pre className="overflow-x-auto text-[13px] p-4 leading-relaxed">
          <code
            className="language-javascript"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    </div>
  );
}
