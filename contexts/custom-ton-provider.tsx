"use client";

import TonConnect from "@tonconnect/sdk";
import { createContext, useContext, useEffect } from "react";
import { TonConnectStorage } from "./custom-ton-storage";
import { MANIFEST_URL } from "@/constants/config";
import { useLoadTonBalance } from "@/hooks/useLoadToken";
import { isMobile } from "@walletconnect/browser-utils";
import { useAuthTonAddress } from "@/stores/authentication/selector";
import { TonNetwork } from "@/constants/networks";

export const CustomTonContext = createContext<{
  connector: TonConnect;
}>({
  connector: new TonConnect({
    manifestUrl: MANIFEST_URL,
    storage: new TonConnectStorage("Ton:root"),
  }),
});

export const CustomTonProvider = (props: React.PropsWithChildren<{}>) => {
  const tonAddress = useAuthTonAddress();

  const { loadAllBalanceTonToken } = useLoadTonBalance({
    tonAddress,
    tonNetwork: TonNetwork.Mainnet,
  });

  const connector = new TonConnect({
    manifestUrl: MANIFEST_URL,
    storage: new TonConnectStorage("Ton:root"),
  });

  useEffect(() => {
    connector.restoreConnection({
      // openingDeadlineMS: 5 * 3600 * 1000, // timeout to reconnect
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener(
        "ton-connect-connection-restoring-started",
        (event) => {
          console.log("connection-restoring-started", event["detail"]);
        }
      );
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "ton-connect-connection-restoring-started",
          (event) => {
            console.log("connection-restoring-started", event["detail"]);
          }
        );
      }
    };
  }, []);

  return (
    <CustomTonContext.Provider value={{ connector }}>
      {props.children}
    </CustomTonContext.Provider>
  );
};

export const useTonConnector = () => {
  const { connector } = useContext(CustomTonContext);

  return { connector };
};
