import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/utils/ui";

export const UserNav = () => {
  const { data: sessionData } = useSession();

  if (!sessionData) {
    return (
      <nav className="flex h-16 items-center px-4">
        <Button
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? "Sign out" : "Sign in"}
        </Button>
      </nav>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={sessionData.user.image ?? undefined}
              alt={sessionData.user.name ?? undefined}
              title={sessionData.user.name ?? undefined}
            />
            <AvatarFallback>
              {sessionData.user.name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {sessionData.user.name}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {sessionData.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void signOut()}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/"
        className="hover:text-primary text-sm font-medium transition-colors"
      >
        Results
      </Link>
      <Link
        href="/picks"
        className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
      >
        Picks
      </Link>
    </div>
  );
}

export const Nav = () => {
  return (
    <nav className="flex h-16 items-center px-4">
      <UserNav />
      <div className="ml-auto flex items-center space-x-4">
        <MainNav />
      </div>
    </nav>
  );
};
