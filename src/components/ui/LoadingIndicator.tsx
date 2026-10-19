export function LoadingIndicator({ label = "Loading" }: { label?: string }) {
  return (
    <span className="loading-indicator" role="status">
      <span className="spinner" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
