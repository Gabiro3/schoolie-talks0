"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prisma from "./lib/db";
import { Prisma, TypeOfVote } from "@prisma/client";
import { JSONContent } from "@tiptap/react";
import { revalidatePath } from "next/cache";
import { BookOpen, Beaker, Globe, History, Users, Atom, Star } from "lucide-react";  // Lucide-react icons

export async function updateUsername(prevState: any, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/api/auth/login");
  }

  const username = formData.get("username") as string;

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        userName: username,
      },
    });

    return {
      message: "Succesfully Updated name",
      status: "green",
    };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return {
          message: "This username is alredy used",
          status: "error",
        };
      }
    }

    throw e;
  }
}

export async function createCommunity(prevState: any, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/api/auth/login");
  }

  try {
    const name = formData.get("name") as string;

    const data = await prisma.subreddit.create({
      data: {
        name: name,
        userId: user.id,
      },
    });

    return redirect(`/r/${data.name}`);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return {
          message: "This Name is alredy used",
          status: "error",
        };
      }
    }
    throw e;
  }
}

export async function updateSubDescription(prevState: any, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/api/auth/login");
  }

  try {
    const subName = formData.get("subName") as string;
    const description = formData.get("description") as string;

    await prisma.subreddit.update({
      where: {
        name: subName,
      },
      data: {
        description: description,
      },
    });

    return {
      status: "green",
      message: "Succesfully updated the description!",
    };
  } catch (e) {
    return {
      status: "error",
      message: "Sorry something went wrong!",
    };
  }
}

export async function createPost(
  { jsonContent }: { jsonContent: JSONContent | null },
  formData: FormData
) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/api/auth/login");
  }

  const title = formData.get("title") as string;
  const imageUrl = formData.get("imageUrl") as string | null;
  const subName = formData.get("subName") as string;
  let subreddit = await prisma.subreddit.findUnique({
    where: { name: subName },
  });
  
  // If the subreddit doesn't exist, create it
  if (!subreddit) {
    subreddit = await prisma.subreddit.create({
      data: {
        name: subName,
        userId: user.id, // Assuming the user is the creator of the new subreddit
      },
    });
  }

  const data = await prisma.post.create({
    data: {
      title: title,
      imageString: imageUrl ?? undefined,
      subName: subName,
      userId: user.id,
      textContent: jsonContent ?? undefined,
    },
  });

  return redirect(`/post/${data.id}`);
}

export async function handleVote(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/api/auth/login");
  }

  const postId = formData.get("postId") as string;
  const voteDirection = formData.get("voteDirection") as TypeOfVote;

  const vote = await prisma.vote.findFirst({
    where: {
      postId: postId,
      userId: user.id,
    },
  });

  if (vote) {
    if (vote.voteType === voteDirection) {
      await prisma.vote.delete({
        where: {
          id: vote.id,
        },
      });

      return revalidatePath("/", "page");
    } else {
      await prisma.vote.update({
        where: {
          id: vote.id,
        },
        data: {
          voteType: voteDirection,
        },
      });
      return revalidatePath("/", "page");
    }
  }

  await prisma.vote.create({
    data: {
      voteType: voteDirection,
      userId: user.id,
      postId: postId,
    },
  });

  return revalidatePath("/", "page");
}

export async function createComment(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/api/auth/login");
  }

  const comment = formData.get("comment") as string;
  const postId = formData.get("postId") as string;

  const data = await prisma.comemnt.create({
    data: {
      text: comment,
      userId: user.id,
      postId: postId,
    },
  });

  revalidatePath(`/post/${postId}`);
}
export async function fetchPosts(search: string) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();


  try {
    let posts;

    // Check if the search query starts with a "/"
    if (search.startsWith("/")) {
      // Remove the "/" to get the category keyword
      const category = search.slice(1);

      // Fetch posts by category
      posts = await prisma.post.findMany({
        where: {
          categories: {
            some: {
              name: {
                contains: category,
                mode: 'insensitive',
              },
            },
          },
        },
        include: {
          categories: true, // Include categories for the post
        },
      });
    } else {
      // Text-based search (searching for post titles)
      posts = await prisma.post.findMany({
        where: {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        include: {
          categories: true, // Include categories for the post
        },
      });
    }

    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error("Failed to fetch posts");
  }
}

// Fetch communities from the database
export async function fetchCommunities(search: string) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();


  try {
    // Fetch communities where the name contains the search term
    const communities = await prisma.subreddit.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
    });

    return communities;
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw new Error("Failed to fetch communities");
  }
}




// Function to map category names to icons
const getCategoryIcon = (categoryName: string) => {
  switch (categoryName) {
    case "Mathematics":
      return typeof Atom; 
    case "Philosophy":
      return typeof BookOpen;
    case "Chemistry":
      return typeof Beaker;
    case "Physics":
      return typeof Atom;
    case "Social life":
      return typeof Users;
    case "History":
      return typeof History;
    case "Geography":
      return typeof Globe;
    default:
      return typeof Star;
  }
};

export async function fetchCategories() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/api/auth/login");
  }

  try {
    // Fetch categories from the database
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    // Add icons to categories
    const categoriesWithIcons = categories.map((category) => ({
      ...category,
      icon: getCategoryIcon(category.name),  // Add icon based on the category name
    }));

    return categoriesWithIcons;
  } catch (error) {
    console.error("Failed to fetch categories", error);
    throw new Error("Failed to fetch categories");
  }
}

