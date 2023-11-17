"use client";

import React, { useEffect, useState } from "react";

import type { LightNode } from "@waku/sdk";
import Poll from "./poll";
import { createNode } from "./waku";

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
      {wakuNode ? <Poll waku={wakuNode} /> : <div>Loading...</div>}
    </div>
  );
};

export default App;
