import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.min.css';


const Footer = () => {
    return (

        <div class="footer" style={{ backgroundColor: 'white', bottom: 0, left: 0, right: 0, padding: '10px 0', borderTop: '1px solid #e0e0e0' }}>

            <footer>
                <div class="text-center p-2" style={{ marginLeft: 'auto', width: 'calc(100% - 250px)' }}>
                    © 2024 Copyright:
                    <a class="text-reset fw-bold" href="https://mdbootstrap.com/">Beemoney.com</a>
                </div>
            </footer>

        </div>
    );
}

export default Footer;
