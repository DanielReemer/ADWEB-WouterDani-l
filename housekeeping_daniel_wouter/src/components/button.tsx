'use client';

export default function Button({
  children,
  onClick,
  className = '',
  type = 'button',
  loading = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`w-full bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-600 hover:to-sky-500 hover:cursor-pointer text-white font-semibold text-lg py-3 rounded-xl shadow-lg transition duration-150 ${
        loading ? 'opacity-60 cursor-not-allowed' : ''
      } ${className}`}
    >
      {loading ? 'Bezig...' : children}
    </button>
  );
}