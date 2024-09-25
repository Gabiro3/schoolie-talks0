"use client"

import { fetchPosts, fetchCommunities } from '@/app/actions'; // Ensure correct path
import { useState, useEffect, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import CommunityResult from './CommunityResult/CommunityResult';
import PostResult from './PostResult/PostResult';
import ResultSkeleton from './ResultSkeleton/ResultSkeleton';

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
    <div className="flex-1 max-w-[690px] hidden md:block px-4">
      <Input
        value={search}
        onChange={updateSearch}
        placeholder="Search Reddit"
        className="w-full rounded-3xl hover:border-post-hover focus:border-post-hover"
      />
      {loading ? (
        <ResultSkeleton />
      ) : (
        <div className="results">
          {posts.map(post => (
            <PostResult key={post.id} {...post} />
          ))}
          {communities.map(community => (
            <CommunityResult key={community.id} {...community} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;

