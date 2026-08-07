import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { Analytics } from "@vercel/analytics/react";
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
        {/* Vercel Web Analytics. Needs the component mounted — enabling the tab
            in the dashboard alone injects nothing outside Next.js. Inside the
            router so client-side route changes are counted as page views. */}
        <Analytics />
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
