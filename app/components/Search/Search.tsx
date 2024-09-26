"use client"

import { fetchPosts, fetchCommunities } from '@/app/actions'; // Ensure correct path
import { useState, useEffect, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import CommunityResult from './CommunityResult/CommunityResult';
import PostResult from './PostResult/PostResult';
import ResultSkeleton from './ResultSkeleton/ResultSkeleton';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react"; // Use any icon package you prefer

const Search = () => {
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);

  useEffect(() => {
    const performSearch = async () => {
      if (search.length === 0) return;

      setLoading(true);

      try {
        if (search.startsWith("/")) {
          // Category-based search
          const fetchedPosts = await fetchPosts(search);
          setPosts(fetchedPosts);
        } else {
          // Text-based search for both posts and communities
          const [fetchedPosts, fetchedCommunities] = await Promise.all([
            fetchPosts(search),
            fetchCommunities(search),
          ]);
          setPosts(fetchedPosts);
          setCommunities(fetchedCommunities);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [search]);

  const updateSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  return (
    <Card className="px-4 py-3 flex items-center gap-x-4 shadow-md rounded-lg">
      <div className="flex items-center gap-x-2 w-full">
        <Input
          value={search}
          onChange={updateSearch}
          placeholder="Search Reddit"
          className="w-full border-none rounded-md shadow-sm focus:ring-0"
        />
        <Button variant="outline" size="icon" className="ml-2">
          <SearchIcon className="w-5 h-5" />
        </Button>
      </div>
      {loading ? (
        <ResultSkeleton />
      ) : (
        <div className="results bg-gray-100 mt-4 p-4 rounded-md w-full">
          {posts.map((post) => (
            <PostResult
              key={post.id}
              communityName={post.communityName}
              postId={post.id}
              title={post.title}
            />
          ))}
          {communities.map((community) => (
            <CommunityResult
              key={community.id}
              name={community.name}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default Search;


