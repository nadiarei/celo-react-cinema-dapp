import HystModal from "hystmodal";
import "hystmodal/dist/hystmodal.min.css";

import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { allBookings, getAllFilms } from "utils/cinema";
import { formatPriceToShow, leadingZero, timeStampToDate } from "utils";
import { renderQRcode, uploadJson, uploadTicketImage } from "../../utils/QRHelper";
import { mintsByUser, safeMint } from "utils/ticketnft";
import { useContractKit } from "@celo-tools/use-contractkit";
import { toast } from "react-toastify";

const nftAddressFile = require("contracts/TicketNFTAddress.json");

// profile Page
const Profile = ({ cinemaContract, ticketNFTContract, address }) => {

    const { performActions } = useContractKit();

    const [tickets, setTickets] = useState(null);
    const [allFilms, setAllFilms] = useState(null);
    const [minted, setMinted] = useState([]);

    const modal = new HystModal({ linkAttributeName: "data-hystmodal" });

    // qr code image data if requested
    const [qr_code, setQRcode] = useState("");

    // fetch minted nfts by user
    const fetchMinted = async () => {
        const mints = await mintsByUser(ticketNFTContract, address);

        setMinted(mints);
    }

    // fetch user's tickets and all films
    const fetchTickets = async () => {

        const films = await getAllFilms(cinemaContract);

        const history = await allBookings(cinemaContract, address);

        // reverse history array so see last purchased tickets first
        let temp = [];

        history.forEach(element => {
            temp.unshift(element)
        });

        setAllFilms(films);

        setTickets(temp);
    }

    // watch qr code button event
    const watchQRcode = async (ticket_id) => {

        setQRcode(await renderQRcode(address, ticket_id, "data"));

        modal.open('#qr_code')
    }

    // mint nft event
    const mintNFT = async (ticket_id) => {

        // upload ticket qr code image to pinata
        // it have been already uploaded so pinata does not upload it again
        // and only returns it's ipfs hash
        const image_hash = await uploadTicketImage(address, ticket_id);

        // get uploaded metadata hash
        const meta_hash = await uploadJson(ticket_id, image_hash);

        toast("Loading, please wait..");

        // mint nft with specific ipfs gateway url
        if (await safeMint(ticketNFTContract, performActions, address, ticket_id, `https://gateway.pinata.cloud/ipfs/${meta_hash}`))
            fetchMinted();
    }

    // render button on ticket
    const renderButton = (ticket_id) => {
        const search = minted.find((value) => value.ticket_id === ticket_id);

        if (search) {
            return <Button variant="outline-dark" className="mx-1" size="sm" href={`https://explorer.celo.org/alfajores/token/${nftAddressFile.TicketNFT}/instance/${search.token_id}`} target="_blank">
                Watch minted ticket
            </Button>
        } else {
            return <Button variant="outline-dark" className="mx-1" size="sm" onClick={() => {
                mintNFT(ticket_id)
            }}>
                Mint Ticket NFT
            </Button>
        }
    }

    useEffect(() => {
        if (cinemaContract && ticketNFTContract && address) {
            fetchMinted();
            fetchTickets();
        }

    }, [cinemaContract, ticketNFTContract])

    return (
        <>
            {tickets && tickets.map((ticket, key) =>
                <div className="card mb-2" key={key}>
                    <div className="row g-0">

                        <img src={allFilms[ticket.film_id]['poster_img']} alt={allFilms[ticket.film_id]['name']} style={{ width: "10%" }} className="h-100 card-img" />

                        <div className="card-body" style={{ display: "contents" }}>

                            <span className="card-text m-2">
                                <h5>Ticket #{ticket.ticket_id}</h5>
                                Film name: {allFilms[ticket.film_id]['name']} <br />
                                Session date: {timeStampToDate(ticket.session_datetime)} <br />
                                Seat: {leadingZero(ticket.seat)}, cost {formatPriceToShow(ticket.seat_price)} CELO
                            </span>
                        </div>
                        <div className="card-footer text-muted">
                            <Button variant="outline-dark" size="sm" onClick={() => {
                                watchQRcode(ticket.ticket_id)
                            }}>
                                Watch QR code
                            </Button>

                            {renderButton(ticket.ticket_id)}

                            <div style={{ float: "right" }}>
                                Purchase date - {timeStampToDate(ticket.purchase_datetime)}
                            </div>

                        </div>
                    </div>

                </div>
            )}
            
            {/* Modal shows qr code of a ticket */}
            <div className="hystmodal hystmodal--simple" id="qr_code" aria-hidden="true">
                <div className="hystmodal__wrap">
                    <div className="hystmodal__window hystmodal__window--long half" style={{ width: "200px", height: "200px" }} role="dialog" aria-modal="true">
                        <button className="hystmodal__close" data-hystclose>Close</button>
                        <div className="hystmodal__styled container-fluid">
                            <img src={qr_code} alt="QR code of a ticket" style={{ width: "100%" }} />
                        </div>
                    </div>
                </div>
            </div>


        </>
    );
};

export default Profile;
