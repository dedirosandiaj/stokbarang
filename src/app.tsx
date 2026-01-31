import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, ErrorBoundary } from "solid-js";
import Loading from "~/components/Loading";
import "./app.css";

export default function App() {
  return (
    <Router
      root={props => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <ErrorBoundary fallback={(err) => (
            <div class="p-4 bg-red-50 text-red-900 min-h-screen">
              <h1 class="text-2xl font-bold mb-2">Application Error</h1>
              <pre class="whitespace-pre-wrap overflow-auto p-4 bg-red-100 rounded text-sm">
                {err.toString()}
                {err.stack && `\n\n${err.stack}`}
              </pre>
            </div>
          )}>
            <Suspense fallback={<Loading />}>{props.children}</Suspense>
          </ErrorBoundary>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
