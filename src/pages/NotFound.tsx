
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import GlassMorphism from '@/components/GlassMorphism';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_#f0f0f0,_transparent_70%)]"></div>
      
      <GlassMorphism className="max-w-md w-full mx-auto px-8 py-12 text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center">
              <div className="absolute inset-0 blur-md bg-purple-200 rounded-full"></div>
              <span className="relative text-5xl">🦝</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">404</h1>
          <p className="text-xl text-black/70 mb-8">
            Even stars sometimes wander off course. Let's bring you back to your galaxy!
          </p>
        </div>
        <Link 
          to="/" 
          className="inline-block px-6 py-3 bg-black text-white rounded-full hover:bg-black/80 transition-colors"
        >
          Return to Your Universe
        </Link>
      </GlassMorphism>
    </div>
  );
};

export default NotFound;
