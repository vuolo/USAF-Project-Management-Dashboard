import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";

import DynamicHead from "~/components/dynamic-head";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { useRouter } from "next/router";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <DynamicHead />
      <Auth>
        <Component {...pageProps} />
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

  return status === "loading" && router.pathname !== "/auth/sign-in" ? (
    <div className="flex h-screen w-screen items-center justify-center">
      Loading...
    </div>
  ) : (
    children
  );
}
