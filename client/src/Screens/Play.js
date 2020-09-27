import React from 'react';
import '../assets/style.css';
import Nav from '../Components/Nav/Nav';
import NavItem from '../Components/Nav/NavItem';
import DropdownMenu from '../Components/Nav/DropdownMenu';
import {ReactComponent as User} from '../assets/iconNav/user.svg';
import {ReactComponent as Plus} from '../assets/iconNav/plus.svg';
import {ReactComponent as Bell} from '../assets/iconNav/bell.svg';
import {ReactComponent as Down} from '../assets/iconNav/down.svg';


function Play() {
  return (
    <Nav>
      <NavItem icon={<User />} />
      <NavItem icon={<Plus />} /> 
      <NavItem icon={<Bell />} />

      <NavItem icon={<Down />}>
        <DropdownMenu />
      </NavItem>

    </Nav>
  );
}


export default Play;
