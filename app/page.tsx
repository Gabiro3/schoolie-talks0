import { Card } from "@/components/ui/card";
import Image from "next/image";
import Banner from "../public/banner.png";
import HelloImage from "../public/books.svg";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreatePostCard } from "./components/CreatePostCard";
import prisma from "./lib/db";
import { PostCard } from "./components/PostCard";
import { Suspense } from "react";
import { SuspenseCard } from "./components/SuspenseCard";
import Pagination from "./components/Pagination";
import { unstable_noStore as noStore } from "next/cache";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { generateUsername } from "unique-username-generator";

async function getData(searchParam: string) {
  noStore();
  const [count, data] = await prisma.$transaction([
    prisma.post.count(),
    prisma.post.findMany({
      take: 10,
      skip: searchParam ? (Number(searchParam) - 1) * 10 : 0,
      select: {
        title: true,
        createdAt: true,
        textContent: true,
        id: true,
        imageString: true,
        Comment: {
          select: {
            id: true,
          },
        },
        User: {
          select: {
            userName: true,
          },
        },
        subName: true,
        Vote: {
          select: {
            userId: true,
            voteType: true,
            postId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return { data, count };
}

export default async function Home({ searchParams }: { searchParams: { page: string } }) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (user) {
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    // If the user doesn't exist in the DB, create a new user
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email ?? "",
          firstName: user.given_name ?? "",
          lastName: user.family_name ?? "",
          imageUrl: user.picture,
          userName: generateUsername("-", 3, 15),
        },
      });
    }
  }

  return (
    <div className="max-w-[1000px] mx-auto flex gap-x-10 mt-4 mb-10">
      <div className="w-[65%] flex flex-col gap-y-5">
        {user && <CreatePostCard />} {/* Only show CreatePostCard if user is logged in */}
        <Suspense fallback={<SuspenseCard />} key={searchParams.page}>
          <ShowItems searchParams={searchParams} user={user} />
        </Suspense>
      </div>
      <div className="w-[35%]">
        <Card>
          <Image src={Banner} alt="Banner" />
          <div className="p-2">
            <div className="flex items-center">
              <Image
                src={HelloImage}
                alt="Hello Image"
                className="w-10 h-16 -mt-6"
              />
              <h1 className="font-medium pl-3">Home</h1>
            </div>
            <p className="text-sm text-muted-foreground pt-2">
              Your Home Schoolie Talks frontpage. Come here to check in with your favorite communities!
            </p>
            <Separator className="my-5" />
            { user && 
            <div className="flex flex-col gap-y-3">
              <Button asChild variant="secondary">
                <Link href="/r/janmarshal/create">Create Post</Link>
              </Button>
              <Button asChild>
                <Link href="/r/create">Create Community</Link>
              </Button>
            </div>}
          </div>
        </Card>
      </div>
    </div>
  );
}

async function ShowItems({ searchParams, user }: { searchParams: { page: string }; user: any }) {
  const { count, data } = await getData(searchParams.page);

  return (
    <>
      {data.map((post) => {
        const userVote = user ? post.Vote.find(vote => vote.userId === user.id) : undefined;

        return (
          <PostCard
            id={post.id}
            imageString={post.imageString}
            jsonContent={post.textContent || "Empty query"}
            subName={post.subName as string}
            title={post.title}
            key={post.id}
            commentAmount={post.Comment.length}
            userName={post.User?.userName as string}
            voteCount={post.Vote.reduce((acc, vote) => {
              if (vote.voteType === "UP") return acc + 1;
              if (vote.voteType === "DOWN") return acc - 1;
              return acc;
            }, 0)}
            createdAt={post.createdAt}
            userVote={userVote?.voteType}  // Pass user's vote type (UP or DOWN or undefined)
          />
        );
      })}

      <Pagination totalPages={Math.ceil(count / 10)} />
    </>
  );
}


