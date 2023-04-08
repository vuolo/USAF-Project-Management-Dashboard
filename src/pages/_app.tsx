import { useRouter } from "next/router";
import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import { ProSidebarProvider } from "react-pro-sidebar";
import { ToastContainer } from "react-toastify";
import { UserX } from "lucide-react";

import DynamicHead from "~/components/dynamic-head";
import Layout from "~/components/layout";

import { api } from "~/utils/api";

import "react-toastify/dist/ReactToastify.css";
import "~/styles/globals.css";
import "react-tooltip/dist/react-tooltip.css";
import "rc-slider/assets/index.css";
import "@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ProSidebarProvider>
        <DynamicHead />
        <Auth>
          <>
            <Component {...pageProps} />
            <ToastContainer
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss={false}
              draggable
              pauseOnHover
              theme="light"
              bodyClassName="text-gray-500 text-sm"
              className="w-screen md:w-[375px]"
            />
          </>
        </Auth>
      </ProSidebarProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);

type AuthProps = {
  children: JSX.Element;
};

function Auth({ children }: AuthProps) {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // Make sure we're not on the sign in page already
      if (router.pathname === "/auth/sign-in") return;

      // Redirect to sign in page
      void router.push("/auth/sign-in");
    },
  });
  const user = session?.db_user;

  // Prevent the user from accessing the app if their account has not been set up
  if (
    !user &&
    status === "authenticated" &&
    router.pathname !== "/auth/sign-in"
  )
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 px-12 pb-[50vh]">
        <div className="flex gap-8">
          <UserX className="mb-3 h-32 w-32 text-red-700 sm:h-16 sm:w-16" />
          <div className="flex flex-col gap-3">
            <h1 className="font-medium">
              You have been signed in but your account has not been set up yet.
            </h1>
            <p>Please contact your administrator to set up your account.</p>
          </div>
        </div>

        <button
          onClick={() => void router.push("/api/auth/signout")}
          className="mt-4 inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:ring-2 active:ring-red-700 sm:mt-0 sm:w-auto"
        >
          Sign Out
        </button>

        <p className="mt-4 text-center text-sm italic">
          (If you are the developer, add your user to the database)
        </p>
      </div>
    );

  // Prevent the user from accessing the sign in page if they're already signed in
  if (status === "authenticated" && router.pathname === "/auth/sign-in")
    void router.push("/");

  // Show loading indicator while loading session status
  return status === "loading" && router.pathname !== "/auth/sign-in" ? (
    <div className="flex h-screen w-screen items-center justify-center">
      Loading...
    </div>
  ) : router.pathname !== "/auth/sign-in" ? (
    <Layout>{children}</Layout>
  ) : (
    children
  );
}
