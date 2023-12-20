export interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}
export const PageHeader = ({
  title,
  description,
  children,
}: PageHeaderProps) => {
  return (
    <div className="m-auto flex flex-col items-center justify-center p-4">
      <h1 className="scroll-m-20 py-2 text-4xl font-extrabold tracking-tight lg:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground pb-2 text-xl">{description}</p>
      )}
      {children}
    </div>
  );
};
