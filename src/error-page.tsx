import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError() as { statusText: string, message: string };
  console.error(error);

  return (
    <div id="error-page" className="flex justify-center items-center flex-col gap-5 h-dvh">
      <h1 className="text-3xl">Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p className="text-slate-400">
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}
