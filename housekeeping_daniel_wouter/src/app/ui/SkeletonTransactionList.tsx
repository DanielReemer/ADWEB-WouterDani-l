export default function SkeletonTransactionList() {
  return (
    <ul className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="border p-3 rounded animate-pulse bg-gray-100">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </li>
      ))}
    </ul>
  );
}
