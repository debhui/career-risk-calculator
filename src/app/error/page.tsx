// app/error/page.tsx
export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="text-gray-600">We couldn’t fetch your profile. Please try again.</p>
    </div>
  );
}
