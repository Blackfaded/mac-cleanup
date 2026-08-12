export type CleanupTarget = {
	id: string;
	name: string;
	description: string;
	consequence: string;
	paths: string[];
	/** Native cleanup actions may not have a meaningful directory-size estimate. */
	size?: () => Promise<number | undefined>;
	clean: () => Promise<void>;
};

export type TargetDiscovery = () => Promise<CleanupTarget[]>;
