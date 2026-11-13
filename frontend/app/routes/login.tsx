import { useAuth0 } from "@auth0/auth0-react-router";
import {
	Avatar,
	Button,
	Card,
	CardContent,
	CardHeader,
	Chip,
	Spinner,
} from "@heroui/react";
import Logo from "~/components/branding/Logo";

export function meta() {
	return [
		{ title: "Sign in | Spendwise" },
		{ name: "description", content: "Sign in to your Spendwise account." },
	];
}

export default function Login() {
	const { loginWithRedirect, logout, isAuthenticated, user, isLoading } =
		useAuth0();

	return (
		<main className="flex min-h-screen items-center justify-center px-4 py-12">
			<Card className="w-full max-w-md border border-default-200/60 bg-background/90 shadow-[0_24px_60px_-24px_rgba(16,185,129,0.38)] backdrop-blur-sm">
				<CardHeader className="flex flex-col items-center gap-4 pb-4 pt-8 text-center">
					<Logo />
					<div className="space-y-2">
						<Chip variant="soft" size="sm">
							SPENDWISE
						</Chip>
						<h1 className="text-3xl font-bold tracking-tight text-foreground">
							Welcome back
						</h1>
					</div>
				</CardHeader>
				<CardContent className="px-6 pb-8">
					{isLoading ? (
						<div
							className="flex items-center justify-center gap-3 py-6 text-sm text-default-600"
							role="status"
						>
							<Spinner size="sm" color="success" />
							Checking your sign-in status...
						</div>
					) : isAuthenticated ? (
						<div className="space-y-5">
							<div className="flex items-center gap-3 rounded-2xl border border-default-200 bg-default-100/80 px-4 py-3">
								<Avatar size="md" className="shrink-0">
									<Avatar.Image
										src={user?.picture}
										alt={user?.name ?? user?.email ?? "Your account"}
									/>
									<Avatar.Fallback>
										{(user?.name ?? user?.email ?? "YA")
											.slice(0, 2)
											.toUpperCase()}
									</Avatar.Fallback>
								</Avatar>
								<div className="min-w-0 text-left">
									<p className="text-xs uppercase tracking-[0.2em] text-default-500">
										Signed in as
									</p>
									<p className="truncate font-semibold text-foreground">
										{user?.name ?? user?.email ?? "Your account"}
									</p>
								</div>
							</div>
							<Button
								variant="primary"
								size="lg"
								className="w-full"
								onPress={() => logout()}
							>
								Sign out
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							<p className="text-center text-sm text-default-600">
								Sign in to continue to your account.
							</p>
							<Button
								variant="primary"
								size="lg"
								className="w-full"
								onPress={() =>
									loginWithRedirect({
										returnTo: `${window.location.origin}/home`,
									})
								}
							>
								Log in with Auth0
							</Button>
							<Button
								variant="secondary"
								size="lg"
								className="w-full"
								onPress={() => loginWithRedirect()}
							>
								Create an account
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</main>
	);
}
