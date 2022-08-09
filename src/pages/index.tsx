import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div>
      <main>
        <p className="text-9xl text-center">Welcome to WEAT</p>
        <div className="mx-auto my-0 mt-12 w-32">
          <div className="border-8 rounded-xl text-center">
            <Link href="/food">
              <a>Join a group and order some food</a>
            </Link>
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
