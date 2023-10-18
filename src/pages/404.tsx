import Link from "next/link";

export default function Error404() {
  return (
    <>
      <div className="px-4md:grid min-h-full w-full bg-slate-100 md:place-items-center">
        <div className="mx-auto max-w-max">
          <main className="px-4 py-16 sm:flex sm:justify-center sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
            <p className="text-4xl font-bold tracking-tight text-stone-100 [text-shadow:_0_2px_0_rgb(0_0_0_/_40%)] sm:text-5xl">
              404
            </p>
            <div className="sm:ml-6">
              <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                <h1 className="text-4xl font-bold tracking-tight text-gray-100 [text-shadow:_0_2px_0_rgb(0_0_0_/_40%)] sm:text-5xl">
                  Page not found
                </h1>
                <p className="mt-1 text-base text-gray-200 [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">
                  Please check the URL in the address bar and try again.
                </p>
              </div>
              <div className="mt-5 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                <Link
                  href="/"
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
                >
                  Go to the dashboard
                </Link>
                {/* <Link
                  href="/support"
                  className="inline-flex items-center rounded-md border border-transparent bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2"
                >
                  Contact support
                </Link> */}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
