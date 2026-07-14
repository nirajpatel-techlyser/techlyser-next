export default function Navbar() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <h1 className="text-2xl font-bold">Techlyser</h1>

        {/* Navigation */}
        <ul className="hidden gap-8 md:flex">
          <li>Home</li>
          <li>Services</li>
          <li>Portfolio</li>
          <li>Blog</li>
          <li>About</li>
          <li>Contact</li>
        </ul>

        {/* Button */}
        <button className="rounded-lg bg-primary px-5 py-2 text-white transition hover:bg-primary-hover">
          Let's Talk
        </button>
      </nav>
    </header>
  );
}
