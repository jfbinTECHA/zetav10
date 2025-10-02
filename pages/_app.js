import "../styles/globals.css";
import { LogsProvider } from "../components/LogsContext";

function MyApp({ Component, pageProps }) {
  return (
    <LogsProvider>
      <Component {...pageProps} />
    </LogsProvider>
  );
}

export default MyApp;
