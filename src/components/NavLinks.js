import { Link, useLocation } from 'react-router-dom';

const NavLinks = ({ userRole }) => {
  const location = useLocation();
    
  if (location.pathname === '/login') {
    return null;
  }
    
  const handleHomeClick = (e) => {
    e.preventDefault();
    window.location.href = '/';
  };
    
  return (
    <>
      <a href="/" onClick={handleHomeClick} style={{ color: 'inherit', textDecoration: 'none', marginRight: '16px' }}>Home</a>
      <Link to="/sales" style={{ color: 'inherit', textDecoration: 'none', marginRight: '16px' }}>Sales</Link>
      <Link to="/products" style={{ color: 'inherit', textDecoration: 'none', marginRight: '16px' }}>Products</Link>
      <Link to="/customer-history" style={{ color: 'inherit', textDecoration: 'none', marginRight: '16px' }}>Customers</Link>
      {userRole === 'admin' && (
        <Link to="/staff" style={{ color: 'inherit', textDecoration: 'none', marginRight: '16px' }}>Staff</Link>
      )}
    </>
  );
};

export default NavLinks;