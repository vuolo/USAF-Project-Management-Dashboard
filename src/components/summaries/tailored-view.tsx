import { Disclosure } from "@headlessui/react";


function TailoredView() {
    return(
      <div className="flex">
        <div className="w-3/6 rounded-md text-center bg-white shadow-md mx-6 mt-5">
          <div className="rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
            <h1>Recently Visited</h1>
          </div>
          <div className="w-full items-center justify-between gap-6 px-8 pb-6 pt-4 sm:min-w-[35rem]">
            Recently visited list here
          </div>
        </div>
        <div className="w-3/6 rounded-md text-center bg-white shadow-md mx-6 mt-5">
          <div className="rounded-t-md bg-brand-dark px-8 py-2 font-medium text-white">
            <h1>Favorites</h1>
          </div>
          <div className="w-full items-center justify-between gap-6 px-8 pb-6 pt-4 sm:min-w-[35rem]">
            Favorites list here
          </div>
        </div>
      </div>
      
    );
}
export default TailoredView;
