import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Sort from "./components/Sort";
import Card from "./components/Card";
import SeatChart from "./components/SeatChart";

// ABIs
import TokenMaster from "./abis/TokenMaster.json";

// Config
import config from "./config.json";

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [tokenMaster, setTokenMaster] = useState(null);
  const [occasions, setOccasions] = useState(null);
  const [occasion, setOccasion] = useState({});
  const [toggle, setToggle] = useState(false);

  const loadBlockchainData = async () => {
    //Ethers Provider

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    //connection to the contract

    const network = await provider.getNetwork();
    const address = config[network.chainId].TokenMaster.address;
    const tokenMaster = new ethers.Contract(address, TokenMaster, provider);
    setTokenMaster(tokenMaster);

    const totalOccasions = await tokenMaster.occasionId();
    const occasions = [];

    await Promise.all(
      Array.from({ length: totalOccasions.toNumber() }, async (_, index) => {
        const occasion = await tokenMaster.getOccasion(index);
        occasions.push(occasion);
      })
    );

    // for (let i = 0; i <= totalOccasions; i++) {
    //   const occasion = await tokenMaster.getOccasion(i);
    //   occasions.push(occasion);
    // }

    setOccasions(occasions);

    console.log(occasions);

    //Updating the account after changing it

    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };
  useEffect(() => {
    loadBlockchainData();
  }, []);

  let disOcs = occasions !== null ? occasions.slice(1) : [];

  return (
    <div>
      <header>
        <Navigation account={account} setAccount={setAccount} />
        <h2 className="header__title">
          <strong>Event</strong> Tickets
        </h2>
      </header>
      <Sort />
      <div className="cards">
        {occasions !== null ? (
          disOcs.map((occasion, index) => (
            <Card
              occasion={occasion}
              id={index + 1}
              tokenMaster={tokenMaster}
              provider={provider}
              account={account}
              toggle={toggle}
              setToggle={setToggle}
              setOccasion={setOccasion}
              key={index}
            />
          ))
        ) : (
          <p>Loading occasions...</p>
        )}
      </div>
      {toggle && (
        <SeatChart
          occasion={occasion}
          tokenMaster={tokenMaster}
          provider={provider}
          setToggle={setToggle}
        />
      )}
    </div>
  );
}

export default App;
