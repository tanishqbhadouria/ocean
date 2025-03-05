"use client";
import { useState, useEffect } from 'react';
import * as fcl from '@onflow/fcl';

fcl.config()
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")

export default function Home() {
  const [user, setUser] = useState({ loggedIn: false });
  const [bountyDetails, setBountyDetails] = useState(null);

  useEffect(() => {
    fcl.currentUser().subscribe(setUser);
  }, []);

  const getBounty = async () => {
    const result = await fcl.query({
      cadence: `
        import Bounty from 0x9d2ade18cb6bea1a
        pub fun main(id: UInt64): Bounty.BountyInfo? {
          return Bounty.bounties[id]
        }
      `,
      args: (arg, t) => [arg(1, t.UInt64)]
    });
    setBountyDetails(result);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Flow Bounty App</h1>
      {user.loggedIn ? (
        <button onClick={() => fcl.unauthenticate()}>Logout</button>
      ) : (
        <button onClick={() => fcl.authenticate()}>Login</button>
      )}
      <button onClick={getBounty} className="ml-4">Get Bounty Details</button>
      {bountyDetails && (
        <pre>{JSON.stringify(bountyDetails, null, 2)}</pre>
      )}
    </div>
  );
}