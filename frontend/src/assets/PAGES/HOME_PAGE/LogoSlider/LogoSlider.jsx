import React from "react";
import "./logoslider.css";

const LogoSlider = () => {
  const logos = [
    "/logos/sap.png",
    "/logos/oracle.png",
    "/logos/microsoft.png",
    "/logos/ibm.png",
    "/logos/aws.png",
    "/logos/deloitte.png",
    "/logos/infosys.png",
    "/logos/tcs.png",
  ];

  return (
    <section className="logo-slider">

      <div className="logo-track">

        {logos.map((logo, index) => (
          <div className="logo-item" key={index}>
            <img src={logo} alt="company logo" />
          </div>
        ))}

        {logos.map((logo, index) => (
          <div className="logo-item" key={`copy-${index}`}>
            <img src={logo} alt="company logo" />
          </div>
        ))}

      </div>

    </section>
  );
};

export default LogoSlider;