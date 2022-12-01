//import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import abi from './abi.json';
import { BigNumber, ethers } from 'ethers';
//import { Buffer } from 'buffer';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/">Collections</Link>
          </li>
          <li>
            <Link to="/tokens">Tokens</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>

        <hr />

        <Routes>
          <Route exact path="/" element={<CollectionsPage/>}/>
          <Route exact path="/tokens" element={<TokensPage/>}/>
          <Route exact path="/about" element={<AboutPage/>}/>
          <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
      </div>
    </Router>
  );
}

function NotFoundPage() {
  return (
    <div className="App">
      <p className='App-text-align-left'>Page not found.</p>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="App">
      <p className='App-text-align-left'>About goes here.</p>
    </div>
  );
}

function CollectionsPage() {
  //console.log(ethers.utils.formatBytes32String(0x0000000000000000000000000000000000000000000000000000000000000000));
  //console.log(ethers.utils.parseBytes32String(0x0000000000000000000000000000000000000000000000000000000000000000));
  //return;
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedAccount, setAccount] = useState(null);
  const [latestCollection, setLatestCollection] = useState(null);
  const [selectedCollectionId, setSelectedCollection] = useState(null);
  const [collectionMetadata, setCollectionMetadata] = useState(null);
  const [input, setInput] = useState('');
  const [gSeed, setSeed] = useState('0x0000000000000000000000000000000000000000000000000000000000000000');
  const [mintState, setMintState] = useState('');
  //const [mintOpenAvailable, setMintOpenAvailable] = useState(false);
  const [seedChecked, setSeedChecked] = useState(false);
  const [seedToUse, setSeedToUse] = useState('0x0000000000000000000000000000000000000000000000000000000000000000');
  //const [tokensOwned, setTokensOwned] = useState(null);

  const contractAddress = "0x186b2785A48518DDE14849Df7F47d95Eb7c4C4f5";

  const checkWalletConnected = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const network = await provider.getNetwork()
    console.log('network:', network.chainId)

    if (!ethereum) {
      alert("Metamask not found!");
      return;
    }

    if (network.chainId !== 5) {
      alert('Need to be on Goerli network.')
      return;
    } else {
      setWalletConnected(true)
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      alert("Could not connect to account.");
      return;
    }
  }

  const connectWalletHandler = async () => {
    const { ethereum } = window;
    
    if (!ethereum) {
      alert('Metamask not found.');
      return;
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } catch (err) {
      alert(err);
      return;
    }
  }

  const connectButton = () => {
    if (walletConnected) {
      return (
        <button onClick={connectWalletHandler}>Connect Wallet</button>
      )
    } else {
      return (
        <p className='redText'>Wallet must be connected to Ethereum main net. Please connect and refersh the page.</p>
      )
    }
  }

  useEffect(() => {
    checkWalletConnected();
  }, [])

  const getLatestCollection = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    const cId = await contract.getNextCollectionId();
    
    //var collectionId = parseInt(cId.toString());
    console.log('next cid:', cId.toString());
    console.log('current cid:', cId.toString() - 1);
    //const md = await contract.collectionMetadata(collectionId - 1);
    //const d = JSON.parse(md.toString());
    //console.log('json:', d);
    //console.log('preview:', d['previewUri']);
    
    setLatestCollection(cId.toString() - 1);
    //setCollectionMetadata(d.toString());
    console.log('selected collection:', latestCollection);
  }

  const getCollectionMetadata = async (cId) => {
    cId === "" ? cId = latestCollection : cId = cId;
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    const md = await contract.collectionMetadata(cId);
    const d = JSON.parse(md.toString());
    console.log('json:', d);
    //console.log('preview:', d['previewUri']);
    
    setCollectionMetadata(d);
    setSelectedCollection(cId);
    //console.log('selected collection:', collectionMetadata.toString());
  }

  const refreshIframe = () => {
    //var alphabet = "123456789abcdef";
    //const seed = '0x' + Array(64).fill(0).map(_=>alphabet[(Math.random()*alphabet.length)|0]).join('')
    //setSeed(seed);
    var ifr = document.getElementsByName('mainIframe')[0];
    var alphabet = "123456789abcdef";
    const seed = '0x' + Array(64).fill(0).map(_=>alphabet[(Math.random()*alphabet.length)|0]).join('')
    setSeed(seed);
    seedChecked ? setSeedToUse(seed) : setSeedToUse('0x0000000000000000000000000000000000000000000000000000000000000000');
    //var url = 'https://' + cMD['uri'].split('//')[1] + '.ipfs.cf-ipfs.com?emseed=' + seed;
    var url1 = 'https://w3s.link/ipfs/' + collectionMetadata['uri'].split('//')[1] + '?emseed=' + gSeed;
    ifr.src = url1;
  }

  const handleSeedChecked = event => {
    if (event.target.checked) {
      setSeedToUse(gSeed);
      console.log('seed to use for mint:', seedToUse);
    } else {
      setSeedToUse('0x0000000000000000000000000000000000000000000000000000000000000000');
      console.log('seed to use for mint:', seedToUse);
    }
    setSeedChecked(current => !current);
  };

  const mintToken = async (cId, cMD) => {
    try {
      console.log('minting collection id:', cId);
      console.log('minting collection md:', cMD);
      if (cMD['enabled'] !== 'true' || parseInt(cMD['openCount']) >= parseInt(cMD['sizeOpen'])) {
        setMintState('Cannot mint, no more tokens available or collection disabled.');
        return;
      }
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      setMintState("Calling Metamask...");
      //const options = { maxFeePerGas: 5000000000, maxPriorityFeePerGas: 5000000000 }
      //const options = { gasLimit: 250000, gasPrice: 4000000000 }
      console.log('minting cid, seed:', cId, seedToUse);
      let mintTxn = await contract.mintTokenOpen(cId, seedToUse, "");
      //mintTxn.maxFeePerGas = 5;
      //mintTxn.maxPriorityFeePerGas = 5;
      setMintState("Minting, pls wait...");
      await mintTxn.wait();
      setMintState('Minting complete, tx id: ' + mintTxn.hash);
      return;
    } catch (e) {
      console.log(e.message.toString())
      setMintState(e.message.toString());
    }
  }

  const CollectionsUi = () => {
    getLatestCollection();
    //var cId = 0;
    //selectedCollectionId !== null ? cId = selectedCollectionId : cId = 0;
    //console.log('getting md for cid:', cId);
    //(cId);
    //console.log('collection metadata:', collectionMetadata.toString());

    //setSelectedCollection(collection);
    //console.log('collection metadata:', collectionMetadata);
    //setCollectionInfo(maxTokens);

    var alphabet = "123456789abcdef";
    const seed = '0x' + Array(64).fill(0).map(_=>alphabet[(Math.random()*alphabet.length)|0]).join('')
    if (gSeed === '0x0000000000000000000000000000000000000000000000000000000000000000') { setSeed(seed); }
    if (collectionMetadata !== null) {
      console.log('collection md:', collectionMetadata);
      var url1 = 'https://w3s.link/ipfs/' + collectionMetadata['uri'].split('//')[1] + '/?emseed=' + gSeed;
      return (
        <>
          <p className='App-text-align-left'>
          Colections available: 0 - {latestCollection} <br/>
          <input value={input} onChange={(e) => setInput(e.target.value)} type="text" placeholder={latestCollection} ></input>
          <button onClick={()=>getCollectionMetadata(input)}> View collection</button>
          <br/>
          <br/>
          Collection id: { input === '' ? latestCollection : input } <br/>
          Collection Name: { collectionMetadata['name'] } <br/>
          Custom seed allowed: { collectionMetadata['allowCustomSeed'] } <br/>
          Current token: { collectionMetadata['cTokenId'] } <br/>
          Description: { collectionMetadata['description'] } <br/>
          Enabled: { collectionMetadata['enabled'] } <br/>
          Max per server wallet: { collectionMetadata['maxPerReserveWallet'] } <br/>
          Name: { collectionMetadata['name'] } <br/>
          Open minted: { collectionMetadata['openCount'] } <br/>
          Preview URI: <a className="App-link" href={ collectionMetadata['previewUri'] } target="_blank" rel="noopener noreferrer">ipfs link</a> <br/>
          Price per token: { collectionMetadata['price'] } <br/>
          Reserve minted: { collectionMetadata['reserveCount'] } <br/>
          Reserve MR: { collectionMetadata['reserveListMerkleRoot'] } <br/>
          Reserve URI: { collectionMetadata['reserveListUri'] } <br/>
          Total open: { collectionMetadata['sizeOpen'] } <br/>
          Total reserve: { collectionMetadata['sizeReserve'] } <br/>
          URI: <a className="App-link" href={ collectionMetadata['uri'] } target="_blank" rel="noopener noreferrer">ipfs link</a> <br/><br/>
          <iframe src={ url1 } height="800" width="800" name="mainIframe" title='mainIframe'></iframe> <br/>
          seed: { gSeed } <input type="checkbox" value={seedChecked} onChange={handleSeedChecked} id="useseed" name="useseed"/> (use seed for mint) <br/><br/>
          <button onClick={ refreshIframe }>Refresh seed</button> <br/><br/>
          <button onClick={()=>mintToken(input === "" ? latestCollection : input, collectionMetadata)}>Mint token</button> <br/>
          </p>
          <br/>
          <br/>
        </>
      );
    } else {
      return (
        <>
          <p className='App-text-align-left'>
            Colections available: 0 - {latestCollection} <br/>
            <input value={input} onChange={(e) => setInput(e.target.value)} type="text" placeholder={latestCollection} ></input>
            <button onClick={()=>getCollectionMetadata(input)}> View collection</button>
            <br/>
          </p>
        </>
      );
    }
  }

  return (
    <div className="App">
      <h4 className="App-text-align-left">ex-machina</h4>
      <div>{ connectedAccount ? CollectionsUi() : connectButton() }</div>
      <p className='App-mint-info'>
        { mintState }
      </p>
    </div>
  );
}

function TokensPage() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedAccount, setAccount] = useState(null);
  const [tokensOwned, setTokensOwned] = useState([]);
  const [tokensOwnedFetched, setTokensOwnedFetched] = useState(false);
  const [tokenMetadata, setTokenMetadata] = useState(null);
  const [input, setInput] = useState('');

  const contractAddress = "0x186b2785A48518DDE14849Df7F47d95Eb7c4C4f5";

  const checkWalletConnected = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const network = await provider.getNetwork()
    console.log('network:', network.chainId)

    if (!ethereum) {
      alert("Metamask not found!");
      return;
    }

    if (network.chainId !== 5) {
      alert('Need to be on Goerli network.')
      return;
    } else {
      setWalletConnected(true)
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      alert("Could not connect to account.");
      return;
    }
  }

  const connectWalletHandler = async () => {
    const { ethereum } = window;
    
    if (!ethereum) {
      alert('Metamask not found.');
      return;
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } catch (err) {
      alert(err);
      return;
    }
  }

  const connectButton = () => {
    if (walletConnected) {
      return (
        <button onClick={connectWalletHandler}>Connect Wallet</button>
      )
    } else {
      return (
        <p className='redText'>Wallet must be connected to Ethereum main net. Please connect and refersh the page.</p>
      )
    }
  }

  useEffect(() => {
    checkWalletConnected();
  }, [])

  const addressEqual = (a, b) => {
    if (a === null && b === null) {
      return true;
    }
    if (a === null && b !== null) {
      return false;
    }
    if (a !== null && b === null) {
      return false;
    }
    return a.toLowerCase() === b.toLowerCase();
  }

  const fetchTokensOwned = async () => {
    if (tokensOwnedFetched === true) {
      return;
    }
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    //const token = await ethers.getContractAt(abi, contractAddress, ethers.provider);
    //console.log('tokens owned by:', connectedAccount);
  
    const sentLogs = await contract.queryFilter(contract.filters.Transfer(connectedAccount, null),);
    const receivedLogs = await contract.queryFilter(contract.filters.Transfer(null, connectedAccount),);
  
    const logs = sentLogs.concat(receivedLogs)
      .sort(
        (a, b) =>
          a.blockNumber - b.blockNumber ||
          a.transactionIndex - b.transactionIndex,
      );
  
    const owned = new Set();
  
    for (const log of logs) {
      const { from, to, tokenId } = log.args;
      
      if (addressEqual(to, connectedAccount)) {
        owned.add(tokenId.toString());
      } else if (addressEqual(from, connectedAccount)) {
        owned.delete(tokenId.toString());
      }
    }
  
    console.log('tokens owned by', connectedAccount, [...owned].join(', '));
    //setTokensOwned(owned);

    /*var ownedTokens = [];
    var ownedTokensMD = [];
    owned.forEach(async elem => {
      //console.log('getting token md', elem);
      var d = await contract.tokenMetadata(elem);
      var tokenMD = JSON.parse(d);
      ownedTokens.push(elem);
      ownedTokensMD.push(tokenMD);
    });*/
    
    setTokensOwned([...owned]);
    setTokensOwnedFetched(true);
    //console.log('owned tokens md:', ownedTokensMD);
  }

  const getTokenMetadata = async (tokenId) => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    var d = await contract.tokenMetadata(tokenId);
    var tokenMD = JSON.parse(d.toString());
    setTokenMetadata(tokenMD);
    console.log('token md:', tokenMD);
  }

  const TokensUi = () => {
    fetchTokensOwned();
    console.log(tokensOwned);
    if (tokensOwned !== [] && tokenMetadata !== null) {
      console.log('tokens:', tokensOwned);
      return (
        <>
          <p className='App-text-align-left'>
            Tokens owned: { tokensOwned.join(', ') } <br/><br/>
            <input value={input} onChange={(e) => setInput(e.target.value)} type="text" placeholder={tokensOwned[0]} ></input>
            <button onClick={()=>getTokenMetadata(input === '' ? tokensOwned[0] : input)}> Fetch token metadata </button>
            <br/><br/>
            Token: {input === '' ? tokensOwned[0] : input} <br/>
            Collection: {tokenMetadata['collection']} <br/>
            Name: {tokenMetadata['name']} <br/>
            Description: {tokenMetadata['description']} <br/>
            Owner: {tokenMetadata['owner']} <br/>
            Collection token #: {tokenMetadata['collection token id']} <br/>
            Collection Uri: {tokenMetadata['uri']} <br/>
            Seed: {tokenMetadata['emseed']} <br/>
            Token Uri: <a className="App-link" href={tokenMetadata['uri'] + '?emseed=' + tokenMetadata['emseed']} target="_blank" rel="noopener noreferrer">ipfs link</a> <br/><br/>
            <iframe src={'https://w3s.link/ipfs/' + tokenMetadata['uri'].split('//')[1] + '?emseed=' + tokenMetadata['emseed']} height="800" width="800" name="mainIframe" title='mainIframe'></iframe> <br/>
          </p>
        </>
      );
    }
    else if (tokenMetadata !== []) {
      return (
        <>
          <p className='App-text-align-left'>
            Tokens owned: { tokensOwned.join(', ') } <br/>
            <input value={input} onChange={(e) => setInput(e.target.value)} type="text" placeholder={tokensOwned[0]} ></input>
            <button onClick={()=>getTokenMetadata(input === '' ? tokensOwned[0] : input)}> Fetch token metadata </button>
            <br/>
          </p>
        </>
      );
    }
  };

  return (
    <div className="App">
      <h4 className="App-text-align-left">ex-machina</h4>
      <div className='App-text-align-left'>Connected with address: {connectedAccount} </div> <br/>
      <div className='App-text-align-left'> { connectedAccount ? TokensUi() : connectButton() } </div>
    </div>
  );
}

export default App;
