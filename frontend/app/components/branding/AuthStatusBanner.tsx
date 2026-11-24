import { useAuth0 } from "@auth0/auth0-react-router";
import { Chip, Spinner } from "@heroui/react";
import { AuthenticatedBurgerMenu } from "~/components/branding/AuthenticatedBurgerMenu";
import Logo from "~/components/branding/Logo";
import { UnauthenticatedBurgerMenu } from "~/components/branding/UnauthenticatedBurgerMenu";

export default function AuthStatusBanner() {
	const { isAuthenticated, isLoading } = useAuth0();
	// const accountName = user?.name ?? user?.email;

	return (
		<header className="bg-background/90 backdrop-blur-sm border-b">
			<div className="mx-auto flex min-h-12 max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
				<div className="flex items-center gap-3">
					<Logo /> <Chip>Spendwise</Chip>
				</div>

				<div className="flex items-center gap-3">
					{isLoading ? (
						<>
							<Spinner size="sm" />
							<span className="text-sm text-muted">Checking sign-in...</span>
						</>
					) : (
						<>
							{isAuthenticated ? (
								<AuthenticatedBurgerMenu />
							) : (
								<UnauthenticatedBurgerMenu />
							)}

							{/* {isAuthenticated && accountName && (
								<span className="max-w-48 truncate text-sm text-muted">
									{accountName}
								</span>
							)} */}
						</>
					)}
				</div>
			</div>
		</header>
	);
}
