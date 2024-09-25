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
        className="w-full rounded-md hover:border-post-hover focus:border-post-hover"
      />
      {loading ? (
        <ResultSkeleton />
      ) : (
        <div className="results bg-gray-100 mt-4 p-4 rounded-md">
  {posts.map((post) => (
    <PostResult
      key={post.id}
      communityName={post.communityName} // Ensure you're passing the community name correctly from post
      postId={post.id} // Pass the postId explicitly
      title={post.title} // Pass the title explicitly
    />
  ))}
  {communities.map((community) => (
    <CommunityResult
      key={community.id}
      name={community.name} // Ensure community name is passed correctly
    />
  ))}
</div>

      )}
    </div>
  );
};

export default Search;

