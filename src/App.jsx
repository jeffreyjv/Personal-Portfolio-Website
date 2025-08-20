import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Home } from "@/pages/Home";
import { NotFound } from "@/pages/NotFound";
import { AnimatedBackground } from "./components/AnimatedBackground";

function App() {
  return (
    <>
      <AnimatedBackground />
      <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
