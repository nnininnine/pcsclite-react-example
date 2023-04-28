import * as React from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [device, setDevice] = React.useState(undefined);

  const GET_UID_APDU = [0xff, 0xca, 0x00, 0x00, 0x00];

  async function connect() {
    try {
      // Request permission to access the USB device
      const device = await navigator.usb.requestDevice({
        filters: [],
      });

      // Open the device
      await device.open();

      // Select the first configuration and interface
      await device.selectConfiguration(1);
      await device.claimInterface(0);

      // Send the APDU to get the UID of the card
      const response = await device.transferOut(
        1,
        new Uint8Array(GET_UID_APDU)
      );
      const result = await device.transferIn(1, 255);

      // The response contains the UID in hexadecimal format
      const uid = Array.from(new Uint8Array(result.data.buffer)).slice(
        0,
        result.data.byteLength - 2
      );
      console.log("Card UID:", uid);
    } catch (error) {
      console.log(error);
    }
  }

  function connectTake2() {
    navigator.usb
      .requestDevice({ filters: [] })
      .then((device) => {
        return device
          .open()
          .then(() => {
            // Connection established, do something with the device
            console.log('connect success')
          })
          .catch((error) => {
            // Handle error
            console.log(error)
          });
      })
      .catch((error) => {
        // Handle permission denied or other errors
      });
  }

  function requestDevices() {
    navigator.usb
      .requestDevice({ filters: [] })
      .then((device) => {
        console.log(device);
        device.open().then(() => {
          console.log("opened");
          device
            .transferIn(1, 8)
            .then((result) => {
              // Data received successfully
              const data = new Uint8Array(result.data.buffer);
              console.log(data);
            })
            .catch((error) => {
              console.log(error);
            });
        });
        setDevice(device);
      })
      .catch((e) => {
        console.log("navigator.usb err: ", e);
      });

    console.log(navigator.usb);
    navigator.usb.getDevices().then((devices) => {
      console.log(`Total devices: ${devices.length}`);
      devices.forEach((device) => {
        console.log(
          `Product name: ${device.productName}, serial number ${device.serialNumber}`
        );
      });
    });
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h6>
          {device !== undefined
            ? `connected device: ${device.productName}`
            : "No connected device asd"}
        </h6>
        <button
          onClick={() => {
            console.log("on click");
            connect();
          }}
        >
          Connect device
        </button>
      </header>
    </div>
  );
}

export default App;
