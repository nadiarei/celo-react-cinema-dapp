import FilmsContainer from "./IndexPanel/FilmsContainer";

import HystModal from "hystmodal";
import "hystmodal/dist/hystmodal.min.css";

// Index page, shows films container to user
const Index = ({ cinemaContract }) => {

    const modal = new HystModal({ linkAttributeName: "data-hystmodal" });

    return (
        <>
            <div className="pricing-header px-3 py-3 pb-md-4 mx-auto text-center">
                <h3 className="display-6">Book a cinema session</h3>
            </div>
                
            <FilmsContainer modal={modal} cinemaContract={cinemaContract} /> 
        </>

    );
};

export default Index;
