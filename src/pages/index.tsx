import { type NextPage } from "next";
import DynamicHead from "~/components/dynamic-head";

const Home: NextPage = () => {
  return (
    <>
      <DynamicHead />
      <h1>Home</h1>
    </>
  );
};

export default Home;
