import { Link } from 'react-router-dom';
export default function NotFound() {
  return <div className="container page center"><h1 className="h2">Page not found</h1><Link to="/" className="btn btn-primary mt-2">Go home</Link></div>;
}
