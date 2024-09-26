import Link from 'next/link';
import React from 'react';

interface CommunityResultProps {
	name: string;
}

const CommunityResult = ({ name }: CommunityResultProps) => {
	return (
		<Link
			href={`/r/${name}`}
			className="flex items-center gap-2 p-2 hover:bg-gray-200 text-primary block"
		>
			<div>
				<div className="text-sm font-medium">{name}</div>
				<div className="text-xs text-gray-500">Community</div>
			</div>
		</Link>
	);
};

export default CommunityResult;

