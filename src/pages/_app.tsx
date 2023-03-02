import { useRouter } from "next/router";
import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import { ToastContainer } from "react-toastify";

import DynamicHead from "~/components/dynamic-head";

import { api } from "~/utils/api";

import "react-toastify/dist/ReactToastify.css";
import "~/styles/globals.css";
import "react-tooltip/dist/react-tooltip.css";
import "rc-slider/assets/index.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
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
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);

type AuthProps = {
  children: JSX.Element;
};

function Auth({ children }: AuthProps) {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      // Make sure we're not on the sign in page already
      if (router.pathname === "/auth/sign-in") return;

      // Redirect to sign in page
      void router.push("/auth/sign-in");
    },
  });

  // Prevent the user from accessing the sign in page if they're already signed in
  if (status === "authenticated" && router.pathname === "/auth/sign-in")
    void router.push("/");

  // Show loading indicator while loading session status
  return status === "loading" && router.pathname !== "/auth/sign-in" ? (
    <div className="flex h-screen w-screen items-center justify-center">
      Loading...
    </div>
  ) : (
    children
  );
}
