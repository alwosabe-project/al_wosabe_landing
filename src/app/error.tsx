'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Caught by Next.js Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <meta name="robots" content="noindex,nofollow" />
      <h2 className="text-2xl font-bold mb-4 text-red-600">عذراً، حدث خطأ في النظام!</h2>
      <p className="text-gray-600 mb-6">يبدو أن هناك مشكلة في الاتصال بالخادم أو جلب البيانات. يرجى المحاولة مرة أخرى لاحقاً.</p>
      <button
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        onClick={() => reset()}
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
