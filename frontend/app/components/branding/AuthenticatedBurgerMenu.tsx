import {
	Button,
	Description,
	Dropdown,
	Kbd,
	Label,
	Separator,
} from "@heroui/react";
import {
	HiArrowRightEndOnRectangle,
	HiBanknotes,
	HiBars2,
	HiMiniChartBar,
	HiMiniUserCircle,
} from "react-icons/hi2";

export function AuthenticatedBurgerMenu() {
	return (
		<Dropdown>
			<Button isIconOnly aria-label="Menu" variant="secondary">
				<HiBars2 />
			</Button>
			<Dropdown.Popover>
				<Dropdown.Menu onAction={(key) => console.log(`Selected: ${key}`)}>
					<Dropdown.Section>
						<Dropdown.Item id="new-file" textValue="New file">
							<div className="flex h-8 items-start justify-center pt-px">
								<HiMiniUserCircle className="size-4 shrink-0 text-muted" />
							</div>
							<div className="flex flex-col">
								<Label>User Profile</Label>
								<Description>View and edit your profile</Description>
							</div>
							<Kbd className="ms-auto" slot="keyboard" variant="light">
								<Kbd.Abbr keyValue="command" />
								<Kbd.Content>N</Kbd.Content>
							</Kbd>
						</Dropdown.Item>
						<Dropdown.Item id="transactions" textValue="Edit file">
							<div className="flex h-8 items-start justify-center pt-px">
								<HiBanknotes className="size-4 shrink-0 text-muted" />
							</div>
							<div className="flex flex-col">
								<Label>Transactions</Label>
								<Description>Add and remove transactions</Description>
							</div>
							<Kbd className="ms-auto" slot="keyboard" variant="light">
								<Kbd.Abbr keyValue="command" />
								<Kbd.Content>E</Kbd.Content>
							</Kbd>
						</Dropdown.Item>
						<Dropdown.Item id="edit-file" textValue="Edit file">
							<div className="flex h-8 items-start justify-center pt-px">
								<HiMiniChartBar className="size-4 shrink-0 text-muted" />
							</div>
							<div className="flex flex-col">
								<Label>Reports</Label>
								<Description>View your spending report</Description>
							</div>
							<Kbd className="ms-auto" slot="keyboard" variant="light">
								<Kbd.Abbr keyValue="command" />
								<Kbd.Content>E</Kbd.Content>
							</Kbd>
						</Dropdown.Item>
					</Dropdown.Section>
					<Separator />
					<Dropdown.Section>
						<Dropdown.Item
							id="delete-file"
							textValue="Delete file"
							variant="danger"
						>
							<div className="flex h-8 items-start justify-center pt-px">
								<HiArrowRightEndOnRectangle className="size-4 shrink-0 text-danger" />
							</div>
							<div className="flex flex-col">
								<Label>Signout</Label>
							</div>
							<Kbd className="ms-auto" slot="keyboard" variant="light">
								<Kbd.Abbr keyValue="command" />
								<Kbd.Abbr keyValue="shift" />
								<Kbd.Content>D</Kbd.Content>
							</Kbd>
						</Dropdown.Item>
					</Dropdown.Section>
				</Dropdown.Menu>
			</Dropdown.Popover>
		</Dropdown>
	);
}
