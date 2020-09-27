import React, {useState, useEffect, useRef} from 'react';
import {ReactComponent as Bell} from '../../assets/iconNav/bell.svg';
import {ReactComponent as Settings} from '../../assets/iconNav/settings.svg';
import {ReactComponent as Left} from '../../assets/iconNav/left.svg';
import { CSSTransition } from 'react-transition-group';

function DropdownMenu() {

    const [activeMenu, setActiveMenu] = useState('main');
    const [menuHeight, setMenuHeight] = useState(null);
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
            <a href="#" className="menu-item" onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}>
                <span className="icon-button">{props.leftIcon}</span>
                {props.children}                
                <span className="icon-right">{props.rightIcon}</span>
            </a>
        );
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

                    <DropdownItem> My profile </DropdownItem>
                    <DropdownItem 
                        leftIcon={<Settings />}
                        rightIcon={<Settings />}
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
