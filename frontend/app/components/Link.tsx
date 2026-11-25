// biome-ignore lint/style/noRestrictedImports: This adapter combines HeroUI styling with React Router navigation
import { Link as HeroLink } from "@heroui/react";
import { linkVariants } from "@heroui/styles";
// biome-ignore lint/style/noRestrictedImports: This adapter combines HeroUI styling with React Router navigation
import { type LinkProps, Link as RouterLink } from "react-router";

const link = linkVariants();

interface LinkIconProps {
	icon?: React.ReactNode | boolean;
	iconPosition?: "start" | "end";
}

type Props = LinkProps & LinkIconProps;

function LinkIcon({ icon }: LinkIconProps) {
	if (!icon) return null;

	if (typeof icon === "boolean")
		return <HeroLink.Icon className={link.icon()} />;

	return <HeroLink.Icon className={link.icon()}>{icon}</HeroLink.Icon>;
}

/**
 * combine the look and feel of the UI library link, but use the features of react router with client and server side loading
 */
export default function Link({
	icon,
	iconPosition = "end",
	children,
	className,
	...rest
}: Props) {
	//handles situations where the css might need to be overridden
	const classNames = className ? `${link.base()} ${className}` : link.base();

	return (
		<RouterLink {...rest} className={classNames}>
			<div className="flex gap-3">
				{iconPosition === "start" && <LinkIcon icon={icon} />}
				{children}
				{iconPosition === "end" && <LinkIcon icon={icon} />}
			</div>
		</RouterLink>
	);
}
