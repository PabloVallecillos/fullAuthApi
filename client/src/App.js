import React from 'react';
import { updateUser, isAuth, getCookie, signout } from './helpers/auth';
import Navbar from './Components/Nav/Nav';
import DropdownMenu from './Components/Nav/DropdownMenu';
import NavItem from './Components/Nav/NavItem';
import NavItemLogo from './Components/Nav/NavItemLogo';
import TravelMap from './Components/Screen1/TravelMap';
import {ReactComponent as Bell} from './assets/iconNav/bell.svg';
import {ReactComponent as Settings} from './assets/iconNav/settings.svg';
import {ReactComponent as Left} from './assets/iconNav/left.svg';

function App({ history }) {

  return (
    <div className="App">
      {/* Nav */}
        <Navbar>
          <NavItemLogo />
          <NavItem icon={<Settings />}>
            <DropdownMenu></DropdownMenu>
          </NavItem>
        </Navbar>
      {/* Nav */}

      {/* Screen1: Map Travel Log  100vh */}
        <TravelMap />
      {/* Screen1: Map Travel Log  100vh */}
    </div>
  );
}

export default App;
