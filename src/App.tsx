import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import { AnimalDetails } from "@/pages/AnimalDetails";
import { Animais } from "@/pages/Animais";
import Profile from "@/pages/Profile";
import Producao from "@/pages/Producao";
import Financeiro from "@/pages/Financeiro";
import Alertas from "@/pages/Alertas";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/animais" element={<Animais />} />
          <Route path="/animal/:id" element={<AnimalDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/producao" element={<Producao />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/nutricao" element={<Index />} />
          <Route path="/reproducao" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
