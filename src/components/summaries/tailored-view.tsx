import Link from "next/link";
import { api } from "~/utils/api";
import { classNames } from "~/utils/misc";

function TailoredView() {

    const { data: favorites } = api.user.getFavorites.useQuery();

    return(
      <div className="flex">
            <div className="w-3/6 rounded-md text-center bg-white shadow-md mx-6 mt-5">
              <div className="rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
                <h1>Recently Visited</h1>
              </div>
              <div className="w-full items-center justify-between gap-6 pb-1 sm:min-w-[35rem]">
                Recently visited list
              </div>
            </div>
            <div className="w-3/6 rounded-md text-center bg-white shadow-md mx-6 mt-5">
              <div className="rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
                <h1>Favorites {"("}{favorites?.length}{")"}</h1>
              </div>
              {favorites && favorites.map((project, index) => (
                <div className="w-full items-center justify-between gap-6 pb-1 sm:min-w-[35rem]">
                    <div
                        className={classNames(
                        "flex items-start justify-between px-4 py-3 text-sm",
                        index % 2 === 1 ? "bg-[#F7F7F7]" : "bg-white"
                        )}
                        key={index}
                    >
                  <Link href={`/projects/${project.projectId}`} className="text-[#2767C8] underline w-fit">
                    {project.project.project_name}
                  </Link>
                  </div>
                </div>
              ))}  
            </div>
      </div>
    );
}
export default TailoredView;
