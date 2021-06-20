// 참조 : https://codesandbox.io/s/9lzmzykjkr?file=/src/index.js:49-58
// 테마컬러 
// Makeup Tan: #DDAF94
// Blush: #E8CEBF
// Complimentary Green: #266150
// Dark Highlight: #4F4846
// Lightly Off White: #FDF8F5

/*global kakao*/
import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import QRCode from "qrcode.react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faWallet, faPlus, faCamera, faMap } from "@fortawesome/free-solid-svg-icons";
import { getBalance, readCount, setCount, fetchCardsOf } from "./api/UseCaver";
import * as KlipAPI from "./api/UseKlip";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./market.css";
import {
  Alert,
  Container,
  Card,
  Nav,
  Form,
  Button,
  Modal,
  Row,
  Col,
} from "react-bootstrap";
import { MARKET_CONTRACT_ADDRESS } from "./constants";


function onPressButton(balance) {
    console.log("hi H I");
}

const onPressButton2 = (_balance, _setBalance) => {
    _setBalance(_balance);
};

const onPressBalance = async (_setBalance) => {
    let address = '0x45027a90d77d400701c18bc7c7d1ff5ef939abc7';
    _setBalance(await getBalance(address));
  }
  

// horizon line 넣는 코드
const HorizonLine = ({ text }) => {
  return (
    <div
      style={{
        width: "100%",
        textAlign: "center",
        borderBottom: "1px solid #aaa",
        lineHeight: "0.1em",
        margin: "10px 0 20px",
      }}>
      <span style={{ background: "#fff", padding: "0 10px" }}>{text}</span>
    </div>
  );
};

const {kakao} = window;
const DEFAULT_QR_CODE = "DEFAULT";
const DEFAULT_ADDRESS = "0x00000000000000000000000000000";


function App() {

    //1.
    const [nfts, setNfts] = useState([]);

    //2.
    const [myBalance, setMyBalance] = useState("0");

    //3.
    const [myAddress, setMyAddress] = useState(DEFAULT_ADDRESS);

    //4.
    const [qrvalue, setQrvalue] = useState(DEFAULT_QR_CODE);

    //5.
    const [tab, setTab] = useState("MARKET"); // MARKET, MINT, WALLET

    //6.
    const [mintImageUrl, setMintImageUrl] = useState("");

    //7.
    const [showModal, setShowModal] = useState(false);

    //8.
    const [modalProps, setModalProps] = useState({
      title: "MODAL",
      onConfirm: () => {},
    });

    //9.
    const rows = nfts.slice(nfts.length / 2);

    //10.
    const fetchMarketNFTs = async () => {
        const _nfts = await fetchCardsOf(MARKET_CONTRACT_ADDRESS);
        setNfts(_nfts);
    };

    //11.
    const fetchMyNFTs = async () => {
        if (myAddress === DEFAULT_ADDRESS) {
        alert("NO ADDRESS");
        return;
        }
        const _nfts = await fetchCardsOf(myAddress);
        setNfts(_nfts);
    };
    
    //12.
    const onClickMint = async (uri) => {
        if (myAddress === DEFAULT_ADDRESS) {
        alert("NO ADDRESS");
        return;
        }
        const randomTokenId = parseInt(Math.random() * 10000000);
        KlipAPI.mintCardWithURI(
        myAddress,
        randomTokenId,
        uri,
        setQrvalue,
        (result) => {
            alert(JSON.stringify(result));
        }
        );
    };

    //13.
    const onClickCard = (id) => {
        if (tab === "WALLET") {
        setModalProps({
            title: "NFT를 마켓에 올리시겠어요?",
            onConfirm: () => {
            onClickMyCard(id);
            },
        });
        setShowModal(true);
        }
        if (tab === "MARKET") {
        setModalProps({
            title: "NFT를 구매하시겠어요?",
            onConfirm: () => {
            onClickMarketCard(id);
            },
        });
        setShowModal(true);
        }
    };

    //14.
    const onClickMyCard = (tokenId) => {
        KlipAPI.listingCard(myAddress, tokenId, setQrvalue, (result) => {
        alert(JSON.stringify(result));
        });
    };
    
    //15.
    const onClickMarketCard = (tokenId) => {
        KlipAPI.buyCard(tokenId, setQrvalue, (result) => {
        alert(JSON.stringify(result));
        });
    };
        
    //16.
    const getUserData = () => {
        setModalProps({
          title: "Klip 지갑을 연동하시겠습니까?",
          onConfirm: () => {
            KlipAPI.getAddress(setQrvalue, async (address) => {
              setMyAddress(address);
              const _balance = await getBalance(address);
              setMyBalance(_balance);
            });
          },
        });
        setShowModal(true);
    };

    //17.
    const onClickGetAddress = () => {
        KlipAPI.getAddress(setQrvalue);
    };

    //18.
    const onClickSetCount = () => {
        KlipAPI.setCount(2000, setQrvalue);
    };

    //19.
    useEffect(() => {
        getUserData();
        fetchMarketNFTs();
    }, []);


    //20.
    return (
        <div className="App">
            <div style={{ backgroundColor: "#DDAF94", padding: 10 }}>
                {/* 1. 상단에 내 주소 + 연동버튼 + 잔고 */}
                <div
                    style={{
                        color:"white",
                        fontSize: 15,
                        fontWeight: "bold",
                        paddingLeft: 5,
                        marginTop: 10,
                    }}
                >
                My Wallet Address
                </div>
                <div style ={{color:"white"}}>
                {myAddress}
                </div>
                
                <Alert
                    onClick={getUserData}
                    variant={"balance"}
                    style={{ backgroundColor: "#E8CEBF", fontSize: 15, color:"white", textAlign: "center"  }}
                >
                {myAddress !== DEFAULT_ADDRESS
                    ? `${myBalance} KLAY`
                    : "지갑 연동하기"}
                </Alert>
                
                {qrvalue !== "DEFAULT" ? (
                    <Container
                        style={{
                        backgroundColor: "white",
                        width: 300,
                        height: 300,
                        padding: 20,
                        }}
                    >
                        <QRCode value={qrvalue} size={256} style={{ margin: "auto" }} />

                        <br />
                        <br />
                    </Container>
                ) : null}

                {/* 2. body 구성 : (1) 갤러리(마켓, 내 지갑) */}
                {tab === "MARKET" || tab === "WALLET" ? (
                    <div className="container" style={{ padding: 0, width: "100%" }}>
                        {rows.map((o, rowIndex) => (
                            <Row key={`rowkey${rowIndex}`}>
                                <Col style={{ marginRight: 0, paddingRight: 0 }}>
                                    <Card
                                        onClick={() => {
                                        onClickCard(nfts[rowIndex * 2].id);
                                        }}
                                    >
                                        <Card.Img src={nfts[rowIndex * 2].uri} />
                                    </Card>
                                
                                    [{nfts[rowIndex * 2].id}]NFT
                                </Col>
                                <Col style={{ marginRight: 0, paddingRight: 0 }}>
                                    {nfts.length > rowIndex * 2 + 1 ? (
                                        <Card
                                            onClick={() => {
                                                onClickCard(nfts[rowIndex * 2 + 1].id);
                                            }}
                                            >
                                            <Card.Img src={nfts[rowIndex * 2 + 1].uri} />
                                        </Card>
                                    ) : null}

                                    {nfts.length > rowIndex * 2 + 1 ? (
                                        <>[{nfts[rowIndex * 2 + 1].id}]NFT</>
                                    ) : null}
                                </Col>
                            </Row>
                        ))}
                    </div>
                ) : null}

                {/* 2. body 구성 : (2) 셀피업로드 페이지 */}

                {tab === "SELFIE" ? (
                    <div className="container" style={{ padding: 0, width: "auto", color:"white", }}>
                        <h3>Selfie NFT</h3>
                        <h5>Keep your special day with your selfies.</h5>
                        <img
                            src="https://previews.123rf.com/images/phoebeyu/phoebeyu1709/phoebeyu170901007/87063262-cartoon-character-design-female-lovely-cute-girl-wearing-straw-hat-making-selfie-collection.jpg"
                            width="300"/>
            
                        <ol
                        className="mw400 center"
                        style={{textAlign: "center"}}>
                            <h5>Upload Your selfie
                            <br/>
                            <br/>
                            <UploadPreview/>
                            </h5>
                            <Button
                                onClick={() => {
                                    onClickMint(mintImageUrl);
                                    }}
                                    variant="primary"
                                    style={{
                                        backgroundColor: "#266150",
                                        borderColor: "#266150",
                                        }}
                            >
                                        발행하기
                            </Button>
                        </ol>
                    </div>
                ) : null}


                {/* 2. body 구성 : (3) 카카오 지도 api */}

                {tab === "KAKAOMAP" ? (
                    <div className="container" style={{ padding: 0, width: "auto", color:"white", }}>
                        <PopUp />
                    </div>
                ) : null}

            </div>

            <br />
            <br />
            <br />
            <br />
            <br />
        
            {/* 3. 모달 */}
        
            <Modal
                centered
                size="sm"
                show={showModal}
                onHide={() => {
                setShowModal(false);
                }}
            >
                <Modal.Header
                    style={{color:"white", border: 0, backgroundColor: "#4F4846", opacity: 0.8 }}
                    >
                    <Modal.Title style={{fontSize:20}}> {modalProps.title} </Modal.Title>
                </Modal.Header>

                <Modal.Footer
                    style={{ border: 0, backgroundColor: "#4F4846", opacity: 0.8 }}
                    >
                    <Button
                        variant="secondary"
                        onClick={() => {
                        setShowModal(false);
                        }}
                        style={{ fontSize: 15, color:"black", backgroundColor: "white", borderColor: "white" }}
                    >
                        닫기
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() => {
                        modalProps.onConfirm();
                        setShowModal(false);
                        }}
                        style={{ fontSize: 15, color:"black", backgroundColor: "white", borderColor: "white" }}
                    >
                        진행
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* 4. 하단 4단 탭 */}

            <nav
                style={{ backgroundColor: "#DDAF94", height: 45 }}
                className="navbar fixed-bottom navbar-light"
                role="navigation"
            >
                <Nav className="w-100">
                    <div className="d-flex flex-row justify-content-around w-100">
                        <div
                        onClick={() => {
                            setTab("MARKET");
                            fetchMarketNFTs();
                        }}
                        className="row d-flex flex-column justify-content-center align-items-center"
                        >
                            <div>
                                <FontAwesomeIcon color="white" size="lg" icon={faHome} />
                            </div>
                        </div>

                        <div
                        onClick={() => {
                            setTab("SELFIE");
                        }}
                        className="row d-flex flex-column justify-content-center align-items-center"
                        >
                            <div>
                                <FontAwesomeIcon color="white" size="lg" icon={faCamera} />
                            </div>
                        </div>

                        <div
                        onClick={() => {
                            setTab("KAKAOMAP");
                        }}
                        className="row d-flex flex-column justify-content-center align-items-center"
                        >
                            <div>
                                <FontAwesomeIcon color="white" size="lg" icon={faMap} />
                            </div>
                        </div>

                        {/* <div
                        onClick={() => {
                            setTab("MINT");
                        }}
                        className="row d-flex flex-column justify-content-center align-items-center"
                        >
                            <div>
                                <FontAwesomeIcon color="white" size="lg" icon={faPlus} />
                            </div>
                        </div> */}

                        <div
                        onClick={() => {
                            setTab("WALLET");
                            fetchMyNFTs();
                        }}
                        className="row d-flex flex-column justify-content-center align-items-center"
                            >
                            <div>
                                <FontAwesomeIcon color="white" size="lg" icon={faWallet} />
                            </div>
                        </div>
                    </div>
                </Nav>
            </nav>    

            {/* <div style = {{backgroundColor:"black",color:"white",padding: 10}}>
                <Container style ={{
                    backgroundColor:"white",
                    width:100,
                    height:100,
                    padding:10 
                    }}>
                    <QRCode value={qrvalue} size={64} style={{margin:"auto" ,marginTop:10}} />
                    <br/>
                    <Button onClick={getUserData} variant="light" size="sm" style={{fontSize:5}}> QRCODE LOAD  </Button>
                </Container>    
                
                <br/>

                <div style={{fontSize:10, fontWeight:"bold", paddingLeft:5, marginTop:10,}}>
                    내 klip 지갑 주소
                </div>
                {myAddress}

                <br/>

                <Alert 
                variant={"balance"} 
                style={{backgroundColor:"yellowgreen", fontSize:25}} >
                    {myBalance} KLAY
                </Alert>  
            </div>
         
            <HorizonLine text="STEP 1" />

            <h3>Selfie NFT</h3>
            <h5>Keep your special day with your selfies.</h5>
            <img
                src="https://previews.123rf.com/images/phoebeyu/phoebeyu1709/phoebeyu170901007/87063262-cartoon-character-design-female-lovely-cute-girl-wearing-straw-hat-making-selfie-collection.jpg"
                width="200"/>

            <ol
            className="mw400 center"
            style={{textAlign: "center"}}>
                <h5>Upload Your selfie
                <br/>
                <br/>
                <UploadPreview/>
                </h5>
            </ol>

            <HorizonLine text="STEP 3" />

            <h5>Check balance</h5>

            <button
                onClick={() => {
                    onPressBalance(setMyBalance)
                }}>Check my Balance</button>

            <h1>{myBalance}KLAY</h1>
            <HorizonLine text="STEP 3" />

            <h5>Get NFT Market address</h5>
            <button
                onClick={() => {
                    onClickGetAddress();
                }}>
                QRCODE Load
            </button>

            <br/>

            <QRCode value={qrvalue}/>

            <p>{myBalance}</p>

            <button
                onClick={() => {
                    onClickSetCount();
                }}>
                SET COUNT
            </button> */}

            {/* 2. body 구성 : (2) 발행 페이지 */}
                {/* {tab === "MINT" ? (
                    <div className="container" style={{ padding: 0, width: "100%" }}>
                        <Card
                            className="text-center"
                            style={{ color: "black", height: "50%", borderColor: "#C5B358" }}
                            >
                            <Card.Body style={{ opacity: 0.9, backgroundColor: "black" }}>
                                {mintImageUrl !== "" ? (
                                <Card.Img src={mintImageUrl} height={"50%"} />
                                ) : null}

                                <Form>
                                    <Form.Group>
                                        <Form.Control
                                        value={mintImageUrl}
                                        onChange={(e) => {
                                            console.log(e.target.value);
                                            setMintImageUrl(e.target.value);
                                        }}
                                        type="text"
                                        placeholder="이미지 주소를 입력해주세요"
                                        />
                                    </Form.Group>
                                <br />
                                    <Button
                                        onClick={() => {
                                        onClickMint(mintImageUrl);
                                        }}
                                        variant="primary"
                                        style={{
                                        backgroundColor: "#810034",
                                        borderColor: "#810034",
                                        }}
                                    >
                                        발행하기
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </div>
                ) : null} */}
        </div>
    );
}

class PopUp extends React
    .Component {
        constructor(props) {
            super(props);	
        }
        map;
        markers = []
        infowindows = []
        componentDidMount(){
            var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
            var options = { //지도를 생성할 때 필요한 기본 옵션
                center: new kakao.maps.LatLng(33.450701, 126.570667), //지도의 중심좌표.
                level: 4 //지도의 레벨(확대, 축소 정도)
            };
            var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

            var iwContent = '<div style="padding:5px; color:black">Yours SELFIE NFT Spot </div>', // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
                iwPosition = new kakao.maps.LatLng(33.450701, 126.570667), //인포윈도우 표시 위치입니다
                iwRemoveable = true; // removeable 속성을 ture 로 설정하면 인포윈도우를 닫을 수 있는 x버튼이 표시됩니다

            // 인포윈도우를 생성하고 지도에 표시합니다
            var infowindow = new kakao.maps.InfoWindow({
                map: map, // 인포윈도우가 표시될 지도
                position : iwPosition, 
                content : iwContent,
                removable : iwRemoveable
            });

        }
        render() {
            return (
                <div id='map' style={{
                        width: '500px', 
                        height: '400px'
                        }}>
                </div>
            )
        }
    }

// Upload image and preview 
class UploadPreview extends React
    .Component {
        constructor(props) {
            super(props);
            this.state = {
                file: null
            };
            this.onChange = this
                .onChange
                .bind(this);
            this.resetFile = this
                .resetFile
                .bind(this);
        }
        onChange(event) {
            this.setState({
                file: URL.createObjectURL(event.target.files[0])
            });
        }

        resetFile(event) {
            event.preventDefault();
            this.setState({file: null});
        }
        render() {
            return (
                <div>
                    <input type="file" onChange={this.onChange}/> {
                        this.state.file && (
                            <div
                                style={{
                                    textAlign: "center"
                                }}>
                                <button onClick={this.resetFile}>Remove File</button>
                            </div>
                        )
                    }
                    <img
                        style={{
                            width: "100%"
                        }}
                        src={this.state.file}/>
                </div>
            );
        }
    }

export default App;
