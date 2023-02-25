import { type NextPage } from "next";
import NavBar from "~/components/nav-bar";

const Home: NextPage = () => {
  return (
    <main className="h-screen w-screen bg-[#dce5f0]">
      <NavBar />
    </main>
  );
};

export default Home;
