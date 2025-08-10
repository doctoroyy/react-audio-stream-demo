import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import './App.css';
import { AudioPlayer } from './components/AudioPlayer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="audio-demo-theme">
      <QueryClientProvider client={queryClient}>
        <AudioPlayer />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
