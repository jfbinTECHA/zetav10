import "../styles/globals.css";
import { LogsProvider } from "../components/LogsContext";
import { SpeedInsights } from "@vercel/speed-insights/next";

function MyApp({ Component, pageProps }) {
  return (
    <LogsProvider>
      <Component {...pageProps} />
      <SpeedInsights />
    </LogsProvider>
  );
}

export default MyApp;
