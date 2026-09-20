import "./App.css";
import { Header } from "./components/Header";
import { ScrollProgressBar } from "./components/ScrollProgressBar";
import { Hero } from "./components/hero/Hero";
import { AboutPage } from "./components/AboutPage";
import { Marquee } from "./components/Marquee";
import { ShortVersion } from "./components/ShortVersion";
import { SelectedWork } from "./components/SelectedWork";
import { Toolkit } from "./components/Toolkit";
import { Pricing } from "./components/Pricing";
import { Contact } from "./components/Contact";

export default function App() {
  return (
    <div className="app">
      <ScrollProgressBar />
      <Header />
      <Hero />
      <AboutPage />
      <Marquee />
      <ShortVersion />
      <SelectedWork />
      <Toolkit />
      <Pricing />
      <Contact />
    </div>
  );
}
