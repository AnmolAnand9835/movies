import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import AppRoutes from './routes/AppRoutes';

const App = () => (
  <div className="flex min-h-screen flex-col">
    <a
      href="#main-content"
      className="sr-only fixed left-4 top-4 z-[200] rounded-lg bg-accent px-4 py-2 text-sm font-bold text-[#111B2A] focus:not-sr-only"
    >
      Skip to content
    </a>
    <ScrollToTop />
    <Navbar />
    <main id="main-content" className="min-w-0 flex-1">
      <AppRoutes />
    </main>
    <Footer />
  </div>
);

export default App;
