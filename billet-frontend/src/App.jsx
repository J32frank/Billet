import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from "./routes";
import './styles/scrollbar.css';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
        refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    },

  },

});

function App(){
  return(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
  <AppRouter />
  <Toaster position="top-right" />
</AuthProvider>

      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App;