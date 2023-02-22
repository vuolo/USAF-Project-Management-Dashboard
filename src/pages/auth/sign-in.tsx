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
  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center gap-8 bg-white pb-[20vh]">
      <Image src="/images/brand/AirForce.jpg" width={200} height={200} alt="" />
      <h1 className="text-3xl font-medium">
        Welcome to the USAF Project Management Dashboard
      </h1>
      {Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <button
            onClick={() => void signIn(provider.id)}
            className="rounded-full bg-black/10 px-10 py-3 font-semibold no-underline transition hover:bg-black/20"
          >
            Sign in with {provider.name}
          </button>
        </div>
      ))}
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
