require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('dotenv').config()

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

task("Deploy", "Deploys a COMPound style governance system")
.addParam("token", "The address to receive the initial supply")
.addParam("timelock", "The timelock administrator")
.addParam("guardian", "The governor guardian").setAction(async taskArgs => {
    
  const { deploy } = require("./scripts/Deploy");

    await deploy({
      tokenRecipient: taskArgs.token,
      timeLockAdmin: taskArgs.timelock,
      guardian: taskArgs.guardian
    });
})

task("Transfer", "Transfer to 2nd & 3rd Address", async () => {
  const accounts = await ethers.getSigners();
  const account = accounts[0]
  const token = await ethers.getContractAt("Comp", process.env.TOKEN)
  // const governor = await ethers.getContractAt("GovernorAlpha", process.env.GOVERNOR_ALPHA)
  // console.log(await token.name(), await governor.name())
  // console.log(token)
  console.log(await token.connect(account).transfer(process.env.METAMASK_ADDRESS_2_PUBLIC_KEY, ethers.BigNumber.from("1000000000000000000000000")))
  console.log(await token.connect(account).transfer(process.env.METAMASK_ADDRESS_3_PUBLIC_KEY, ethers.BigNumber.from("1000000")))
})

task("Delegate", "Delegate to self", async () => {
  const accounts = await ethers.getSigners();
  const account = accounts[0]
  const token = await ethers.getContractAt("Comp", process.env.TOKEN)
  const result = await token.connect(account).delegate(account.address)
  console.log(result)
})

task("Propose", "Submit a proposal", async () => {
  const accounts = await ethers.getSigners();
  const account = accounts[1]
  const token = await ethers.getContractAt("Comp", process.env.TOKEN)
  const governor = await ethers.getContractAt("GovernorAlpha", process.env.GOVERNOR_ALPHA)
  const teamAddress = process.env.METAMASK_ADDRESS_3_PUBLIC_KEY
  const grantAmount = ethers.BigNumber.from("100000")
  const transferCalldata = token.interface.encodeFunctionData("transfer", [teamAddress, grantAmount]);

  const res = await governor.connect(account).propose(
      [process.env.TOKEN],
      [0],
      ["transfer(dst,rawAmount)"],
      [transferCalldata],
      "This is a sample proposal"
  )

  console.log(res)

})

task("DeployProxy", "Deploy Proxy Voting Service")
    .addParam("governor", "The address that the proxy votes on")
    .setAction(async taskArgs => {
        const ProxyVoter = await ethers.getContractFactory("Proxy");
        const proxyVotingService = await ProxyVoter.deploy(taskArgs.governor);
        await proxyVotingService.deployed();
        await proxyVotingService.deployTransaction.wait();
        console.log(`Proxy Voting Service deployed to: ${proxyVotingService.address}`);
    })

task("VoteWithProxy", "Vote with Proxy")
    .addParam("id", "The proposal id")
    .setAction(async taskArgs => {
      const accounts = await ethers.getSigners();
      const account = accounts[0]
      const proxy = await ethers.getContractAt("Proxy", process.env.PROXY_VOTING_CONTRACT)

      // console.log(proxy)
      const result = await proxy.connect(account).castVote(parseInt(taskArgs.id))
      console.log(result)
    })

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API}`,
      accounts: [`0x${process.env.METAMASK_PRIVATE_KEY}`,`0x${process.env.METAMASK_PRIVATE_KEY_2}`]
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API}`,
      accounts: [`0x${process.env.METAMASK_PRIVATE_KEY}`,`0x${process.env.METAMASK_PRIVATE_KEY_2}`]
    }
  },
  solidity: "0.5.16",
};

