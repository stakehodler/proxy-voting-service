# Proxy Voting Service

Proof of concept for an on-chain proxy voting service.

The proxy voting service can have infinite conditions but in this proof-of-concept, it only has one - It will always vote the opposite to a nemesis address.

# Deployment

### Phase 1 (Deploy your Compound Governance System): 

1. Copy the `.env.example` to `.env`. Fill in variables for: INFURA_API, METAMASK_PRIVATE_KEY, METAMASK_PRIVATE_KEY_2, METAMASK_ADDRESS_2_PUBLIC_KEY,METAMASK_ADDRESS_3_PUBLIC_KEY. *Note that public keys should be prefixed with 0x, but private keys are not*
2. Ensure your wallet has some eth and rinkeby and run `npx hardhat Deploy --token 0xAddressToSendTokensTo --timelock 0xTimeLockAdminAddress --guardian 0xGovernorAlphaAdminAddress --network rinkeby`. *Note that for proof-of-concept, I just use my first metamask address for all*
3. If deployment is successful, make a note of what addresses the contracts were deployed to. If not, something has gone wrong. Don't continue until you have successfully deployed the above.

### Phase 2 (Deploy the Proxy):

1. Go to Line 49 in ProxyVotingService.sol. Here you'll find a variable named "nemesis". Set it to your public key address number 2 i.e. METAMASK_ADDRESS_2_PUBLIC_KEY.
2. Run `npx hardhat compile`
3. Run `npx hardhat DeployProxy --governor 0xGovernorAlphaAddress --network rinkeby`
4. Ensure, deployment was successful, make a note of the voting service proxy address.

### Phase 3 (Prep the wallets and contracts):

*We need to distribute the token across our wallets, and assign delegates for voting ability*

1. Copy the addresses of the token, timelock, governor_alpha, and proxy into the `.env`
2. Run `npx hardhat Transfer --network rinkeby`. This will transfer 3m to address 2 and 4m to address 3. Note that address 1 should have 3m tokens left.
3. Run `npx hardhat DelegateToSelf --address 0xAddress1 --network rinkeby`
4. Run `npx hardhat DelegateToSelf --address 0xAddress2 --network rinkeby`
5. Run `npx hardhat DelegateToProxy --address 0xAddress3 --network rinkeby`. The proxy service is now responsible for 3m worth of votes.

*If you are using MetaMask, I would recommend adding the token to the wallets*

### Phase 4 (Submit a proposal, submit votes and watch the proxy in action):

1. Run `npx hardhat Propose --network rinkeby`. This submits a proposals from address 1. 
2. Run `npx hardhat VoteWithProxy --id 1 --network rinkeby`. This will trigger the cast vote function on proxy. Note that we don't need to express our support. It's handled automatically.

**Check the Proxy Event Logs, you'll see No Vote was cast. This is because our 'nemesis' address 2 is yet to vote.**

3. Run `npx hardhat VoteWithAddress --address 2 --id 1 --support true --network rinkeby`. Here we will use address 2 to vote for proposal number 1.
4. On confirmed, run `npx hardhat VoteWithProxy --id 1 --network rinkeby`

**In the event logs you'll see Vote Against was cast.**

We can then verify these results by querying the Govenor Alpha.

### Phase 5 (Verification):






