"use client";

import { fetchPosts, fetchCommunities } from '@/app/actions'; // Ensure correct path
import { useState, useEffect, ChangeEvent, useRef } from 'react';
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
  const [showResults, setShowResults] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement | null>(null); // Ref for the search component

  useEffect(() => {
    const performSearch = async () => {
      if (search.length === 0) {
        setShowResults(false);
        return;
      }

      setLoading(true);
      setShowResults(true); // Show results when there's a search

      try {
        if (search.startsWith("/")) {
          const fetchedPosts = await fetchPosts(search);
          setPosts(fetchedPosts);
        } else {
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

  // Hide results when clicking outside the search component
  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowResults(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex-1 max-w-[690px] px-4" ref={searchRef}>
      {/* Sticky Search Card */}
      <div className="sticky top-0 z-10">
        <Card className="px-4 py-2 flex items-center gap-x-4 shadow-md rounded-lg">
          <div className="flex items-center gap-x-2 w-full">
            <Input
              value={search}
              onChange={updateSearch}
              placeholder="Search for Questions"
              className="w-full border-none rounded-md shadow-sm focus:ring-0"
            />
            <Button variant="outline" size="icon" className="ml-2">
              <SearchIcon className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Ensure the results appear above everything with z-index */}
      {loading ? (
        <ResultSkeleton />
      ) : (
        showResults && (
          <div className="absolute top-[100%] left-0 w-full bg-white border rounded-md shadow-lg mt-2 max-h-[300px] overflow-y-auto z-50">
            <div className="p-2">
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
          </div>
        )
      )}
    </div>
  );
};

export default Search;



