export default function Logo() {
	return (
		<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-white shadow-md shadow-accent-hover/60 border-black">
			<img
				src="/spendwiselogo.svg"
				alt="Spendwise"
				className="h-14 w-14 p-2 shadow-md"
			/>
		</div>
	);
}
