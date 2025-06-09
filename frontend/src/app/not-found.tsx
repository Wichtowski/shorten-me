export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-darkest to-primary-dark">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-lightest mb-4">404</h1>
        <p className="text-xl text-primary-light">Short URL not found</p>
        <a href="/" className="mt-4 inline-block text-primary-lightest hover:text-white">
          Return to Home
        </a>
      </div>
    </div>
  );
} 