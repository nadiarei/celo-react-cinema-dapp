import { useState, useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useContractKit } from "@celo-tools/use-contractkit";
import { Notification } from "components/ui/Notifications";
import Wallet from "components/Wallet";
import Cover from "components/Cover";
import { Link } from "react-router-dom";

import { useBalance, useCinemaContract, useTicketNFTContract } from "hooks";
import { getUserRole } from "utils/cinema";

import Profile from "components/pages/Profile";
import TicketInfo from "components/pages/TicketInfo";
import AdminPanel from "components/pages/AdminPanel";
import Index from "components/pages/Index";

import "./App.css";

const App = function AppWrapper() {
  const { address, destroy, connect } = useContractKit();
  const { balance } = useBalance();

  // contracts initializing
  const cinemaContract = useCinemaContract();
  const ticketNFTContract = useTicketNFTContract();

  // role of a user, can be client/manager/owner
  const [userRole, setUserRole] = useState(null);

  const fetchUserRole = async () => {
    setUserRole(await getUserRole(cinemaContract, address));
  }

  useLayoutEffect(() => {
    if (cinemaContract && address)
      fetchUserRole();
  }, [address, cinemaContract, userRole]);

  return (
    <>
      <Notification />
      <BrowserRouter>
        {address ? (
          <Container fluid="md">
            <Nav className="pt-3 pb-5">
              <Nav.Item className="ml-auto">
                <Navbar.Brand as={Link} to="/">
                  <h3>Cinema</h3>
                </Navbar.Brand>
              </Nav.Item>
              <Nav.Item className="ms-auto">
                {/*display user wallet*/}
                <Wallet
                  address={address}
                  userRole={userRole}
                  amount={balance.CELO}
                  symbol="CELO"
                  destroy={destroy}
                />
              </Nav.Item>
            </Nav>
            <main>
              <Routes>
                <Route index element={<Index cinemaContract={cinemaContract} />} />
                
                {(userRole === "owner" || userRole === "manager")  &&
                  <Route path="admin" element={<AdminPanel cinemaContract={cinemaContract} userRole={userRole}/>} />
                }

                <Route path="profile" element={<Profile cinemaContract={cinemaContract} ticketNFTContract={ticketNFTContract} address={address} />} />

                <Route path="ticket_info/:address/ticket/:ticket_id" element={<TicketInfo cinemaContract={cinemaContract} wallet_address={address} userRole={userRole} />} />
              </Routes>
            </main>
          </Container>
        ) : (
          // display cover if user is not connected
          <div className="App">
            <header className="App-header">
              <Cover connect={connect} />
            </header>
          </div>
        )}
      </BrowserRouter>
    </>
  );
};

export default App;
