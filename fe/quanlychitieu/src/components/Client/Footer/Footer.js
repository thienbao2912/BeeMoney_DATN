import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.min.css';


const Footer = () => {
    return (

        <div class="footer">

            <footer class="text-center text-lg-start bg-body-tertiary text-muted">

                <section class="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">

                    <div class="me-5 d-none d-lg-block" style={{marginLeft:"15.5rem"}}>
                        <span>Kết nối với chúng tôi qua mạng xã hội:</span>
                    </div>

                    <div>
                        <a href="" class="me-4 text-reset">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="" class="me-4 text-reset">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="" class="me-4 text-reset">
                            <i class="fab fa-google"></i>
                        </a>
                        <a href="" class="me-4 text-reset">
                            <i class="fab fa-instagram"></i>
                        </a>
                        <a href="" class="me-4 text-reset">
                            <i class="fab fa-linkedin"></i>
                        </a>
                        <a href="" class="me-4 text-reset">
                            <i class="fab fa-github"></i>
                        </a>
                    </div>

                </section>

                <section class="">
                    <div class="container text-center text-md-start mt-5">

                        <div class="row mt-3">

                            <div class="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">

                                <h6 class="text-uppercase fw-bold mb-4">
                                    <i class="fas fa-gem me-3"></i>BEE MONEY
                                </h6>
                                <p>
                                    Giải pháp tiết kiệm tài chính, chi tiêu cá nhân miễn phí dành cho mọi người
                                </p>
                            </div>


                            <div class="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">

                                <h6 class="text-uppercase fw-bold mb-4">
                                    Thư Viện
                                </h6>
                                <p>
                                    <a href="#!" class="text-reset">Chat GPT</a>
                                </p>
                                <p>
                                    <a href="#!" class="text-reset">ReactJs</a>
                                </p>
                                <p>
                                    <a href="#!" class="text-reset">React Native</a>
                                </p>
                                <p>
                                    <a href="#!" class="text-reset">Bootstrap</a>
                                </p>

                            </div>

                            <div class="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">

                                <h6 class="text-uppercase fw-bold mb-4">
                                    Tài liệu
                                </h6>
                                <p>
                                    <a href="#!" class="text-reset">Pricing</a>
                                </p>
                                <p>
                                    <a href="#!" class="text-reset">Settings</a>
                                </p>
                                <p>
                                    <a href="#!" class="text-reset">Orders</a>
                                </p>
                                <p>
                                    <a href="#!" class="text-reset">Help</a>
                                </p>
                            </div>

                            <div class="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">

                                <h6 class="text-uppercase fw-bold mb-4">Contact</h6>
                                <p><i class="fas fa-home me-3"></i> Việt Nam, Cần Thơ</p>
                                <p>
                                    <i class="fas fa-envelope me-3"></i>
                                    beemoney@gmail.com
                                </p>
                                <p><i class="fas fa-phone me-3"></i> + 01 234 567 88</p>
                                <p><i class="fas fa-print me-3"></i> + 01 234 567 89</p>
                            </div>

                        </div>

                    </div>
                </section>

                <div class="text-center p-4">
                    © 2024 Copyright:
                    <a class="text-reset fw-bold" href="https://mdbootstrap.com/">Beemoney.com</a>
                </div>

            </footer>

        </div>
    );
}

export default Footer;
