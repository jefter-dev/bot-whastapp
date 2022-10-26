import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
let socket;

const getDescriptionEnglishStatus = (statusSession) => {
  if (statusSession == "isLogged") {
    return "When the user is already logged in to the browser";
  } else if (statusSession == "notLogged") {
    return "When the user is not connected to the browser, it is necessary to scan the QR code through the cell phone in the option WhatsApp Web";
  } else if (statusSession == "browserClose") {
    return "If the browser is closed this parameter is returned";
  } else if (statusSession == "qrReadSuccess") {
    return "If the user is not logged in, the QR code is passed on the terminal a callback is returned. After the correct reading by cell phone this parameter is returned";
  } else if (statusSession == "qrReadFail") {
    return "If the browser stops when the QR code scan is in progress, this parameter is returned";
  } else if (statusSession == "autocloseCalled") {
    return "The browser was closed using the autoClose command";
  } else if (statusSession == "desconnectedMobile") {
    return "Client has desconnected in to mobile";
  } else if (statusSession == "serverClose") {
    return "Client has desconnected in to wss";
  } else if (statusSession == "deleteToken") {
    return "If you pass true within the function client.getSessionTokenBrowser(true)";
  } else if (statusSession == "chatsAvailable") {
    return "When Venom is connected to the chat list";
  } else if (statusSession == "deviceNotConnected") {
    return "Chat not available because the phone is disconnected (Trying to connect to the phone)";
  } else if (statusSession == "serverWssNotConnected") {
    return "The address wss was not found!";
  } else if (statusSession == "noOpenBrowser") {
    return "It was not found in the browser, or some command is missing in args";
  } else if (statusSession == "initBrowser") {
    return "Starting the browser";
  } else if (statusSession == "openBrowser") {
    return "The browser has been successfully opened!";
  } else if (statusSession == "connectBrowserWs") {
    return "Connection with BrowserWs successfully done!";
  } else if (statusSession == "initWhatsapp") {
    return "Starting whatsapp!";
  } else if (statusSession == "erroPageWhatsapp") {
    return "Error accessing whatsapp page";
  } else if (statusSession == "successPageWhatsapp") {
    return "Page Whatsapp successfully accessed";
  } else if (statusSession == "waitForLogin") {
    return "Waiting for login verification!";
  } else if (statusSession == "waitChat") {
    return "When the user is already logged in to the browser";
  } else if (statusSession == "successChat") {
    return "Chat successfully loaded!";
  }
};

const getDescriptionStatus = (statusSession) => {
  if (statusSession == "isLogged") {
    return "Usuário logado com sucesso";
  } else if (statusSession == "notLogged") {
    return "Usuário não está logado, necessita escanear o QR pelo celular na opção web";
  } else if (statusSession == "browserClose") {
    return "Navegador foi fechado";
  } else if (statusSession == "qrReadSuccess") {
    return "QR code escaneado com sucesso";
  } else if (statusSession == "qrReadFail") {
    return "Escaneamento do QR code obteve um erro";
  } else if (statusSession == "autocloseCalled") {
    return "O navegador foi fechado usando o comando autoClose";
  } else if (statusSession == "desconnectedMobile") {
    return "O usuário se desconectou do celular";
  } else if (statusSession == "serverClose") {
    return "O usuário se desconectou do wss";
  } else if (statusSession == "deleteToken") {
    return "o token foi deletado";
  } else if (statusSession == "chatsAvailable") {
    return "Venom está conectado à lista de bate-papo";
  } else if (statusSession == "deviceNotConnected") {
    return "O bate-papo não está disponível porque o telefone está desconectado(Tente conectar o telefone)";
  } else if (statusSession == "serverWssNotConnected") {
    return "O endereço wss não foi encontrado!";
  } else if (statusSession == "noOpenBrowser") {
    return "Não foi encontrado no navegador ou está faltando algum comando nos argumentos";
  } else if (statusSession == "initBrowser") {
    return "Iniciando o navegador";
  } else if (statusSession == "openBrowser") {
    return "O navegador foi aberto com sucesso!";
  } else if (statusSession == "connectBrowserWs") {
    return "Conexão com BrowserWs feita com sucesso!";
  } else if (statusSession == "initWhatsapp") {
    return "Iniciando o whatsapp!";
  } else if (statusSession == "erroPageWhatsapp") {
    return "Erro ao acessar a página do whatsapp";
  } else if (statusSession == "successPageWhatsapp") {
    return "Página Whatsapp acessada com sucesso";
  } else if (statusSession == "waitForLogin") {
    return "Aguardando verificação de login!";
  } else if (statusSession == "waitChat") {
    return "Aguardando o carregamento do chat";
  } else if (statusSession == "successChat") {
    return "Bate-papo carregado com sucesso!";
  } else {
    return statusSession;
  }
};

const user = "12216533424";

const Home = () => {
  const [statusSession, setStatusSession] = useState(false);
  const [imgQrCode, setImgQrCode] = useState(false);

  const socketInitializer = async () => {
    console.log("socketInitializer");

    fetch(`/api/socket?user=${user}`);

    setStatusSession("Carregando...");
    socket = io();

    socket.on("connect", () => {
      console.log("connected mm");

      socket.emit("statusSession", "test");
    });

    socket.on("statusSession", (status) => {
      console.log("statusSession: ", status);

      if (status == "qrReadFail" || status == "successChat") {
        setImgQrCode(false);
      }

      setStatusSession(status);
    });

    socket.on("imgQrCode", (imgQrCode) => {
      console.log("imgQrCode: ", imgQrCode);
      setImgQrCode(imgQrCode);
    });
  };

  const socketDesconnect = () => {
    return socket.disconnect();
  };

  const sendMessage = () => {
    const message = document.getElementById("message").value;
    const phoneNumber = document.getElementById("phoneNumber").value;

    console.log("message: ", message);
    console.log("phoneNumber: ", phoneNumber);

    socket.emit("sendMessage", { message, phoneNumber });

    return false;
  };

  const sendFile = () => {
    const message = document.getElementById("message").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const file = document.getElementById("file");
    const nameFile = "32220732346158000104550010000000471997931720";

    if (file.files.length == 0) {
      console.log("Selecione um arquivo.");
    } else {
      console.log("FILE: ", file.files);
      socket.emit(
        "sendFile",
        { file: file.files[0], message, phoneNumber, nameFile },
        (status) => {
          console.log("STATUS DO UPLOAD: ", status);
        }
      );
    }

    return false;
  };

  const restartPage = () => {
    return window.location.reload();
  }

  return (
    <div className="container">
      {!statusSession ? (
        <button onClick={socketInitializer}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span>Conectar ao whatsapp</span>
        </button>
      ) : (
        <div class="containerStatus">
          <div
            className={
              statusSession == "qrReadFail"
                ? `status statusDanger`
                : `status statusSuccess`
            }
          >
            {getDescriptionStatus(statusSession)}
          </div>
          <div className="containerImage">
            {statusSession == "qrReadFail" ? (
              <a href="javascript:;" onClick={restartPage}>
                Recarregar novamente
              </a>
            ) : (
              <>
                {imgQrCode ? (
                  <Image
                    src={`/qrcode/${user}/${imgQrCode}`}
                    alt="Image QR code conection whatsapp"
                    width={300}
                    height={300}
                  />
                ) : statusSession != "successChat" &&
                  statusSession != "chatsAvailable" ? (
                  <div class="loader"></div>
                ) : (
                  <div className="containerSendMessage">
                    <label>Enviar Mensagem</label>
                    <input id="phoneNumber" />
                    <textarea rows={5} id="message"></textarea>
                    <a href="javascript:;" onClick={sendMessage}>
                      Send message
                    </a>

                    <div className="containerFile">
                      <input id="file" className="inputFile" type="file" />
                      <a
                        href="javascript:;"
                        onClick={sendFile}
                        className="buttonFile"
                      >
                        Send File
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
