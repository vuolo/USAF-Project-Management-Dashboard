import Head from "next/head";
import { useRouter } from "next/router";

interface Props {
  meta?: {
    title: string;
    description: string;
    cardImage: string;
  };
}

const DynamicHead = ({ meta: pageMeta }: Props): JSX.Element => {
  const router = useRouter();

  // Default meta, can be overridden by pageMeta if provided
  const meta = {
    title: "USAF Project Management Dashboard",
    description: "Senior Design Spr/Fall 2023",
    cardImage: "/og.png",
    ...pageMeta,
  };

  // TODO: add a case switch for router.pathname to set the title
  // and description for each page

  return (
    <Head>
      <title>{meta.title}</title>
      <meta name="robots" content="follow, index" />
      <link href="/favicon.ico" rel="shortcut icon" />
      <meta content={meta.description} name="description" />
      <meta
        property="og:url"
        content={`https://metispm.azurewebsites.net${router.asPath}`}
      />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:image" content={meta.cardImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@vercel" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.cardImage} />

      {/* RealFaviconGenerator.net Favicon Package */}
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#2b5797" />
      <meta name="msapplication-TileColor" content="#2b5797" />
      <meta name="theme-color" content="#ffffff" />
    </Head>
  );
};

export default DynamicHead;
