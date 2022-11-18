import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
let socket;

const Home = () => {
  const [status, setStatus] = useState(false);
  const [imgQrCode, setImgQrCode] = useState(false);

  const socketInitializer = async () => {
    setStatus("Carregando...");
    
    fetch(`/api/socket`);
    // fetch(`https://bot-whastapp.vercel.app/api/socket?user=${user}`);
    socket = io();

    socket.on("connect", () => {
      console.log("connected mm");
    });

    socket.on("status", (status) => {
      console.log("[status]: ", status);

      setStatus(status);

      if(status == "Client is ready!") {
        const canvas = document.getElementById("canvas");
        canvas.style.display = "none";

        // display: none;
        // setTimeout(() => {
        //   window.location.reload();
        // }, 4000)
      }
    });

    socket.on("qr", (qr) => {
      console.log("qr: ", qr);

      // index.js -> bundle.js
      var QRCode = require("qrcode");
      var canvas = document.getElementById("canvas");

      QRCode.toCanvas(canvas, qr, function (error) {
        if (error) {
          console.error(error);
        } else {
          console.log("success!");
          setImgQrCode(true);
        }
      });
    });
  };

  const socketDesconnect = () => {
    return socket.disconnect();
  };

  const sendMessage = () => {
    const message = document.getElementById("message").value;
    const phone = document.getElementById("phone").value;

    console.log("message: ", message);
    console.log("phone: ", phone);

    socket.emit("message", { message, phone });

    return false;
  };

  const sendFile = async () => {
    const message = document.getElementById("message").value;
    const phone = document.getElementById("phone").value;
    const file = document.getElementById("file");
    const nameFile = "32220732346158000104550010000000471997931720";

    if (file.files.length == 0) {
      console.log("Selecione um arquivo.");
    } else {
      let fileBase64 = await toBase64(file.files[0]);
      fileBase64 = fileBase64.replace("data:application/pdf;base64,", "");

      console.log("fileBase64: ", fileBase64);

      // console.log("FILE: ", file.files);
      socket.emit(
        "file",
        { file: fileBase64, message, phone, nameFile },
        (status) => {
          console.log("STATUS DO UPLOAD: ", status);
        }
      );
    }

    return false;
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  return (
    <div className="container">
      {status && (
        <>
          <div class="containerStatus">
            <div className={`status statusSuccess`}>{status}</div>
          </div>
          {status == "QR RECEIVED" && "Escaneie o código para continuar"}
          {status == "Client is ready!" && (
            <div align="center">
              Aguarde mais uns instantes...<div class="loader"></div>
            </div>
          )}
          {status == "Saved session!" && "PRONTO PARA USO"}
        </>
      )}
      <canvas id="canvas"></canvas>
      {!imgQrCode &&
        (status == "Client is ready!"
          ? "Client connected"
          : !status &&
            "Client connected" && (
              <div className="containerSendMessage">
                <button onClick={socketInitializer}>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span>Conectar ao whatsapp</span>
                </button>
              </div>
            ))}
      {/* <div className="containerSendMessage">
        <label>Enviar Mensagem</label>
        <input id="phone" />
        <textarea rows={5} id="message"></textarea>
        <a href="javascript:;" onClick={sendMessage}>
          Send message
        </a>

        <div className="containerFile">
          <input id="file" className="inputFile" type="file" />
          <a href="javascript:;" onClick={sendFile} className="buttonFile">
            Send File
          </a>
        </div>
      </div> */}

      {/* {!statusSession ? (
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
                    src={imgQrCode}
                    unoptimized
                    blurDataURL={imgQrCode}
                    placeholder="blur"
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
                    <input id="phone" />
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
      )} */}
    </div>
  );
};

export default Home;
