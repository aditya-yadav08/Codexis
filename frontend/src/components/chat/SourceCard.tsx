import { Card } from "@/components/ui/card";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";

export default function SourceCard({ source }: any) {
  const highlighted = Prism.highlight(
    source.snippet || "",
    Prism.languages.javascript,
    "javascript",
  );

  return (
    <Card className="p-4 space-y-3">
      {/* File Header */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-800">{source.file}</span>

        <span className="text-xs text-gray-400">
          Lines {source.start_line} - {source.end_line}
        </span>
      </div>

      {/* Explanation */}
      {/* {source.explanation && (
        <p className="text-sm text-gray-500">{source.explanation}</p>
      )} */}

      {/* Code Block */}
      <div className="bg-[#0d1117] rounded-lg overflow-hidden">
        <pre className="overflow-x-auto text-sm p-4 leading-relaxed">
          <code
            className="language-javascript"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    </Card>
  );
}
