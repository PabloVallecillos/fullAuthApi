import React, {useState, useEffect, useRef} from 'react';
import {ReactComponent as Login} from '../../assets/iconNav/login.svg';
import {ReactComponent as Logout} from '../../assets/iconNav/logout.svg';
import {ReactComponent as Settings} from '../../assets/iconNav/settings.svg';
import {ReactComponent as Left} from '../../assets/iconNav/left.svg';
import { CSSTransition } from 'react-transition-group';
import { useHistory } from "react-router-dom";
import { updateUser, isAuth, getCookie, signout } from '../../helpers/auth';
import SlideToggleContent from '../SlideToggleContent/SlideToggleContent';
function DropdownMenu() {

    const history = useHistory();
    const [activeMenu, setActiveMenu] = useState('main');
    const [menuHeight, setMenuHeight] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setMenuHeight(dropdownRef.current?.firstChild.offsetHeight+40)
    }, [])

    function calcHeight(el) {
        const height = el.offsetHeight+40;
        setMenuHeight(height);
    }

    function DropdownItem(props){
        return (
            <a href={props.href} className="menu-item" onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}>
                <span className="icon-button">{props.leftIcon}</span>
                    {props.children}
                <span className="icon-right">{props.rightIcon}</span>
            </a>
        );
    }

    const handleLogout = () => {
        signout(() => {
            history.push('/login');
        })
    }

    return (

            <div className="dropdown" style={{height: menuHeight}} ref={dropdownRef}>
                <CSSTransition
                    in={activeMenu === 'main'}
                    unmountOnExit
                    timeout={500}
                    classNames="menu-primary"
                    onEnter={calcHeight}
                >
                    <div className="menu">

                        {!isAuth() &&
                            <DropdownItem
                                    leftIcon={<Login />}
                                    href="/login"
                                >
                                    Login
                            </DropdownItem>
                        }

                        {isAuth() &&
                            <DropdownItem
                                leftIcon={<Logout />}
                                href="/login"
                            >
                                <p onClick={handleLogout} className="m-0">Logout</p>
                            </DropdownItem>
                        }

                        <DropdownItem
                            leftIcon={<Login />}
                            rightIcon={<Login />}
                            goToMenu="settings"
                        >
                            Settings
                        </DropdownItem>

                    </div>
                </CSSTransition>

                <CSSTransition
                    in={activeMenu === 'settings'}
                    unmountOnExit
                    timeout={500}
                    classNames="menu-secondary"
                    onEnter={calcHeight}
                >
                    <div className="menu">
                        <DropdownItem leftIcon={<Left />} goToMenu="main" />
                        <DropdownItem> Settings </DropdownItem>
                        <DropdownItem> Settings </DropdownItem>
                        <DropdownItem> Settings </DropdownItem>

                    </div>
                </CSSTransition>
            </div>
        
    );
}

export default DropdownMenu;
