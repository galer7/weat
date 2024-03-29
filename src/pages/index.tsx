import type { NextPage } from "next";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const { status } = useSession();
  const router = useRouter();

  return (
    <div>
      <main>
        <div className="absolute left-0 right-0 bottom-0 top-1/3">
          <p className="text-9xl text-center text-yellow-500">WEAT</p>
          <p className="text-center text-white italic">
            A collaborative layer for food delivery services
          </p>
          <div className="rounded-xl text-center bg-teal-800 border-8 border-transparent table mx-auto my-4">
            <button
              onClick={(e) => {
                e.preventDefault();

                if (status === "authenticated") router.push("/food");
                else signIn("google");
              }}
            >
              <a className="text-teal-200">Join a group and order some food</a>
            </button>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-0 w-full text-center">
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
