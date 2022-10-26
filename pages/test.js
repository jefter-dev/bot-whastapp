import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { io } from "Socket.IO-client";
let socket;

const Home = () => {
  const [statusSession, setStatusSession] = useState("LOADING...");
  const [imgQrCode, setImgQrCode] = useState(false);

  useEffect(() => {
    socketInitializer();
  }, []);

  const socketInitializer = useCallback(async () => {
    await fetch("/api/socket");
    socket = io();

    socket.on("connect", () => {
      console.log("connected mm");
    });

    socket.on("statusSession", (status) => {
      console.log("statusSession: ", status);
      setStatusSession(status);
    });

    socket.on("imgQrCode", (imgQrCode) => {
      console.log("imgQrCode: ", imgQrCode);
      setImgQrCode(imgQrCode);
    });
  }, []);

  const onChangeHandler = (e) => {
    setInput(e.target.value);
    socket.emit("input-change", e.target.value);
  };

  return (
    <>
      <div>{statusSession}</div>
      <br />
      <br />
      {imgQrCode && (
        <img src={`/${imgQrCode}`} alt='test image'/>
      )}
    </>
  );
};

export default Home;
