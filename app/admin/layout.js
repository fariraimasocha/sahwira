export default function AdminLayout({ children }) {
  return (
    <div className="container flex-1 items-start md:grid lg:grid-cols-[1fr] pb-12 md:gap-6 lg:gap-10 max-w-[80.5rem]">
      {children}
    </div>
  );
}