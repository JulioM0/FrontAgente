import React from "react";
import "../Estilos/navbar.css";
import logo from "../assets/logo-nova.svg";

const Navbar = () => {
    return (
        <header className="header-container">
            <div className="logo-bar">
                <img src={logo} alt="Logo" className="logo" />
                <div className="info">
                    <label>Menú de activos</label>
                </div>
            </div>
            <nav className="nav-bar">
                <a href="#" className="nav-item active">Inicio</a>
                <a href="#" className="nav-item">Configuración</a>
                <a href="#" className="nav-item">Salir</a>
            </nav>
        </header>
    );
};

export default Navbar;