'use client';

export default function LoadingComponent() {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-800">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute h-full w-full animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
            <span className="absolute text-sm font-semibold text-gray-600">Laden</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">Even geduld aub...</h1>
            <p className="text-gray-500">De inhoud wordt geladen</p>
          </div>
        </div>
      </div>
    );
  }
  