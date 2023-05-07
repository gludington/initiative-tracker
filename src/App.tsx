import { useEffect, useRef, useState } from "react";

import OBR from "@owlbear-rodeo/sdk";
import { InitiativeHeader } from "./InitiativeHeader";
import { InitiativeTracker } from "./InitiativeTracker";

const ID = `rodeo.owlbear.initiative-tracker-beyond20`;
/**
 * 
 * @param onMessageReceived a function to execute on a mesage from Owlbear-Beyond20
 * @param onRegistration a function to execute upon successful registration with Owlbear-Beyond20
 * @param onRegistrationFailed a function to execute if registration fails
 *
 */
const register = ({ onMessageReceived, onRegistration, onRegistrationFailed }:
  { onMessageReceived(message: any): void, onRegistration?(): void, onRegistrationFailed?(): void }) => {

  console.info(`Registering $ID with Owlbear-Beyond20`);
  let registered = false;
  window.setTimeout(function () {
    if (!registered) {
      console.warn(`${ID} did not receive a registration response in 5 seconds`);
      if (onRegistrationFailed) {
        onRegistrationFailed();
      }
    }}, 5000);
    window.addEventListener("message", function (e) {
      if (e.origin !== "https://www.owlbear.app") return;
      if (OBR.isReady) {
        if (e.data?.DdbEvent) {
          const ddbData = e.data.DdbEvent;
          console.info(`${ID} Received from Owlbear-Beyond20`, ddbData);
          onMessageReceived(ddbData);
        } else if (e.data.DdbRegistration) {
          registered = true;
          if (onRegistration) {            
            onRegistration();
          }
        }
      } else {
        console.warn(`${ID} received ddbData but OBR not ready`);
      }
    });
  window.parent.postMessage({ action: "DdbRegister", id: ID }, "https://www.owlbear.app");
}


export function App() {
  const [sceneReady, setSceneReady] = useState(false);
  const [message, setMessage] = useState();
  useEffect(() => {
    OBR.scene.isReady().then(setSceneReady);
    return OBR.scene.onReadyChange(setSceneReady);
  }, []);

  useEffect(() => {
    if (sceneReady) {
      register({
        onMessageReceived: (message) => {
          setMessage(message);
        }
      })
    }
  }, [sceneReady, setMessage]);
  
  if (sceneReady) {
    return <InitiativeTracker message={message} />;
  } else {
    // Show a basic header when the scene isn't ready
    return (
      <InitiativeHeader subtitle="Open a scene to use the initiative tracker" />
    );
  }
}
