import { useEffect, useState } from "react";
import { type ReactNode } from "react";
import NavBar from "./nav/nav-bar";
import SideBarNav from "~/components/nav/sidebar-nav";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

interface Props {
  children: ReactNode;
}

function Layout({ children }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState<string | null | undefined>(null);
  const { data: project } = api.project.get_view.useQuery(
    {
      id: parseInt((router.query.id as string | undefined) || "-1"),
    },
    {
      enabled: router.pathname.startsWith("/projects/") && !!router.query.id,
      onSuccess: (data) => {
        setTitle(data?.project_name);
      },
    }
  );

  useEffect(() => {
    if (!router.pathname.startsWith("/projects/")) {
      setTitle(null);
      return;
    }
    const projectId = router.query.id as string | undefined;
    if (!projectId) setTitle(null);
  }, [router.pathname, router.query]);

  return (
    <>
      <NavBar title={title} />
      <div className="hidden sm:relative sm:flex sm:w-screen">
        <SideBarNav />
        <div className="ml-[75px] mr-0 flex overflow-hidden">{children}</div>
      </div>
      <div className="block sm:hidden">{children}</div>
    </>
  );
}

export default Layout;
