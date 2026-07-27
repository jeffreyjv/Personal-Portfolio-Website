import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { Home } from "@/pages/Home";
import { NotFound } from "@/pages/NotFound";

function App() {
  return (
    // reducedMotion="user" drops transform/layout animation for visitors who ask
    // for less motion, but keeps opacity — they get cross-fades, not a dead page.
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
