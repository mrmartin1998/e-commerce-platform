import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer p-10 bg-base-200 text-base-content">
      <nav>
        <h6 className="footer-title">Shop</h6>
        <Link href="/products" className="link link-hover">All Products</Link>
        <Link href="/categories" className="link link-hover">Categories</Link>
        <Link href="/deals" className="link link-hover">Deals</Link>
        <Link href="/new-arrivals" className="link link-hover">New Arrivals</Link>
      </nav>
      <nav>
        <h6 className="footer-title">Company</h6>
        <Link href="/about" className="link link-hover">About us</Link>
        <Link href="/contact" className="link link-hover">Contact</Link>
        <Link href="/careers" className="link link-hover">Careers</Link>
        <Link href="/press" className="link link-hover">Press kit</Link>
      </nav>
      <nav>
        <h6 className="footer-title">Legal</h6>
        <Link href="/terms" className="link link-hover">Terms of use</Link>
        <Link href="/privacy" className="link link-hover">Privacy policy</Link>
        <Link href="/cookie" className="link link-hover">Cookie policy</Link>
      </nav>
      <form>
        <h6 className="footer-title">Newsletter</h6>
        <fieldset className="form-control w-80">
          <label className="label">
            <span className="label-text">Enter your email address</span>
          </label>
          <div className="join">
            <input type="email" placeholder="username@site.com" className="input input-bordered join-item" />
            <button className="btn btn-primary join-item">Subscribe</button>
          </div>
        </fieldset>
      </form>
    </footer>
  );
} 