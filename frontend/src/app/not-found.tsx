import { Spinner } from "@components/common/Spinner";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-sm leading-6 text-[#bac9cc]">Page not found</p>
      </div>
    </div>
  );
}
