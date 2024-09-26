import Link from 'next/link';
import React from 'react';

interface PostResultProps {
	communityName: string;
	title: string;
	postId: string;
}

const PostResult = ({ communityName, postId, title }: PostResultProps) => {
	return (
		<Link
			href={`/post/${postId}`}
			className="p-2 hover:bg-gray-200 block"
		>
			<div className="text-xs font-semibold">r/{communityName}</div>
			<div className="text-sm">{title}</div>
		</Link>
	);
};

export default PostResult;
