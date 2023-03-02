export function toastMessage(header: string, message: string) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-900">{header}</p>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
