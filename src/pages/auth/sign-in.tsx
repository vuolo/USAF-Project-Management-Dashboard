import { useEffect, useState } from "react";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { getProviders, signIn } from "next-auth/react";

import { authOptions } from "~/server/auth";

function SignIn({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // Store the NextAuth.js error code if in the URL query string
  const [errorCode, setErrorCode] = useState<string | null>(null);
  useEffect(() => {
    setErrorCode(new URLSearchParams(window.location.search).get("error"));
  }, []);

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center gap-8 bg-white px-2 pb-[20vh] text-center">
      <Image src="/images/brand/AirForce.jpg" width={200} height={200} alt="" />
      <h1 className="text-3xl font-medium">
        Welcome to the USAF Project Management Dashboard
      </h1>

      {/* Sign In Button(s) */}
      {Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <button
            onClick={() => void signIn(provider.id)}
            className="rounded-full bg-black/10 px-10 py-3 font-medium no-underline transition hover:bg-black/20"
          >
            Sign in with {provider.name}
          </button>
        </div>
      ))}

      {/* Display Error Code (if present) */}
      {errorCode && (
        <p className="text-red-500">
          <span className="font-medium">Error: </span>
          <span>{errorCode}</span>
        </p>
      )}
    </main>
  );
}

export default SignIn;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  if (session) return { redirect: { destination: "/" } };

  const providers = await getProviders();

  return {
    props: { providers: providers ?? [] },
  };
}
