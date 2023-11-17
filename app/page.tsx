"use client";

import React, { useEffect, useState } from "react";

import type { LightNode } from "@waku/sdk";
import Poll from "./poll";
import { createNode } from "./lib/waku";

const App: React.FC = () => {
  const [wakuNode, setWakuNode] = useState<LightNode | null>(null);
  useEffect(() => {
    if (wakuNode) return;

    (async () => {
      console.log("starting node");
      const node = await createNode();
      console.log("node started");
      setWakuNode(node);
    })();
  }, [wakuNode]);

  return (
    <div className="App">
      {wakuNode ? <Poll waku={wakuNode} /> : <div className="bg-black flex justify-center pt-40 text-xl space-x-3 items-center animate-pulse">
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.348 14.651a3.75 3.75 0 0 1 0-5.303m5.304 0a3.75 3.75 0 0 1 0 5.303m-7.425 2.122a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12Zm.375 0a.375.375 0 1 1-.75 0a.375.375 0 0 1 .75 0Z" />
        </svg>
        <h1>Connecting to the network</h1>
      </div>}
    </div>
  );
};

export default App;
