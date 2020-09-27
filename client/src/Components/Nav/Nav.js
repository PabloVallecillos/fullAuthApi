import React from 'react';

function Nav(props) {
  return (
      <nav className="navbar1">
        <ul className="ul1 navbar-nav1">
          {props.children}
        </ul>
      </nav>
  );
}

export default Nav;
