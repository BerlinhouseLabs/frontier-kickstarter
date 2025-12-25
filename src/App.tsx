import { SponsorProvider } from "./context/SponsorContext";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <SponsorProvider>
      <Dashboard />
    </SponsorProvider>
  );
}
