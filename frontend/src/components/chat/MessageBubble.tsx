import SourceCard from "./SourceCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MessageBubble({ message }: any) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] bg-blue-500 text-white px-4 py-3 rounded-xl text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-medium">
        AI
      </div>

      <div className="flex-1 space-y-6">
        {/* AI Response */}
        <div className="text-[15px] text-gray-800">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              /* Paragraph */
              p({ children }) {
                return <p className="leading-7 mb-4">{children}</p>;
              },

              /* Section Headings */
              h1({ children }) {
                return (
                  <h1 className="text-xl font-semibold mt-6 mb-3">
                    {children}
                  </h1>
                );
              },

              h2({ children }) {
                return (
                  <h2 className="text-lg font-semibold mt-6 mb-2">
                    {children}
                  </h2>
                );
              },

              h3({ children }) {
                return (
                  <h3 className="text-base font-semibold mt-5 mb-2">
                    {children}
                  </h3>
                );
              },

              /* Lists */
              ul({ children }) {
                return (
                  <ul className="list-disc ml-6 space-y-2 mb-4">{children}</ul>
                );
              },

              li({ children }) {
                return <li className="leading-7">{children}</li>;
              },

              /* Inline Code */
              code({ inline, children }: any) {
                if (inline) {
                  return (
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900">
                      {children}
                    </span>
                  );
                }

                return (
                  <pre className="bg-[#0d1117] text-gray-100 rounded-lg p-4 overflow-x-auto text-sm my-4">
                    <code>{children}</code>
                  </pre>
                );
              },

              /* Strong text */
              strong({ children }) {
                return (
                  <span className="font-semibold text-gray-900">
                    {children}
                  </span>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-500">
              Relevant Code
            </div>

            {message.sources.map((s: any, i: number) => (
              <SourceCard key={i} source={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
