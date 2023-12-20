import { Session } from "next-auth";
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

export interface SessionNavProps {
  session: Session | null;
}

export const UserNav = ({ session }: SessionNavProps) => {
  if (!session) {
    return (
      <nav className="flex h-16 items-center px-4">
        <Button onClick={session ? () => void signOut() : () => void signIn()}>
          {session ? "Sign out" : "Sign in"}
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
              src={session.user.image ?? undefined}
              alt={session.user.name ?? undefined}
              title={session.user.name ?? undefined}
            />
            <AvatarFallback>
              {session.user.name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.name}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {session.user.email}
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
  session,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & SessionNavProps) {
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
      {session?.user.email === "travis.saylor@gmail.com" && (
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
        >
          Admin
        </Link>
      )}
    </div>
  );
}

export const Nav = () => {
  const { data: sessionData } = useSession();

  return (
    <nav className="flex h-16 items-center px-4">
      <UserNav session={sessionData} />
      <div className="ml-auto flex items-center space-x-4">
        <MainNav session={sessionData} />
      </div>
    </nav>
  );
};
