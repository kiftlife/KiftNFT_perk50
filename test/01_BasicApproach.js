const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { ethers } = require('hardhat');
const {
  BASE_PREREVEAL_URL,
  CHAINLINK_KEY_HASH,
  LOCAL_OPENSEA_PROXY
} = require('../config/config');
const { expect } = require('chai');

describe('50% Off Perk', function () {
  const deployKiftablesContracts = async () => {
    const [deployer, gnosisSafe, wallet1, wallet2] = await ethers.getSigners();

    const MOCK_SUBSCRIPTION_ID = 0;
    const vrfCoordinatorContract = 'MockVRFCoordinator';

    const kiftContractFactory = await ethers.getContractFactory('Kiftables');
    const vrfCoordFactory = await ethers.getContractFactory(
      vrfCoordinatorContract
    );
    const mockVrfCoordinator = await vrfCoordFactory.connect(deployer).deploy();

    const kiftContract = await kiftContractFactory.deploy(
      BASE_PREREVEAL_URL,
      CHAINLINK_KEY_HASH,
      mockVrfCoordinator.address,
      MOCK_SUBSCRIPTION_ID,
      LOCAL_OPENSEA_PROXY,
      gnosisSafe.address
    );

    console.log(`Kiftables contract address: ${kiftContract.address}`);

    return {
      kiftContract,
      mockVrfCoordinator,
      deployer,
      gnosisSafe,
      wallet1,
      wallet2
    };
  };

  const deployPerkContract = async () => {
    const { kiftContract } = await loadFixture(deployKiftablesContracts);
    const perkContractFactory = await ethers.getContractFactory(
      'KiftablesPerkFiftyOff'
    );
    const perkContract = await perkContractFactory.deploy(kiftContract.address);
    console.log(`Perk contract address: ${perkContract.address}`);
    return { perkContract };
  };

  const mintKiftablesContract = async () => {
    const { kiftContract, deployer, wallet1 } = await loadFixture(
      deployKiftablesContracts
    );
    await kiftContract.connect(deployer).setIsPublicSaleActive(true);
    await kiftContract
      .connect(wallet1)
      .mint(1, { value: ethers.utils.parseEther('0.1') });

    return {
      kiftContract,
      deployer,
      wallet1
    };
  };

  describe('Mint', () => {
    it('Should redeem', async () => {
      const [deployer, gnosisSafe, wallet1, wallet2] =
        await ethers.getSigners();

      const MOCK_SUBSCRIPTION_ID = 0;
      const vrfCoordinatorContract = 'MockVRFCoordinator';

      const kiftContractFactory = await ethers.getContractFactory('Kiftables');
      const vrfCoordFactory = await ethers.getContractFactory(
        vrfCoordinatorContract
      );
      const mockVrfCoordinator = await vrfCoordFactory
        .connect(deployer)
        .deploy();

      const kiftContract = await kiftContractFactory.deploy(
        BASE_PREREVEAL_URL,
        CHAINLINK_KEY_HASH,
        mockVrfCoordinator.address,
        MOCK_SUBSCRIPTION_ID,
        LOCAL_OPENSEA_PROXY,
        gnosisSafe.address
      );

      const perkContractFactory = await ethers.getContractFactory(
        'KiftablesPerkFiftyOff'
      );
      const perkContract = await perkContractFactory.deploy(
        kiftContract.address
      );
      console.log(`Perk contract address: ${perkContract.address}`);

      await kiftContract.connect(deployer).setIsPublicSaleActive(true);
      await kiftContract
        .connect(wallet1)
        .mint(1, { value: ethers.utils.parseEther('0.1') });

      expect(await kiftContract.ownerOf(0)).to.equal(wallet1.address);

      // 1. Check not redeemed init state
      expect(await perkContract.redeemedPerks(0)).to.equal(false);

      // 2. Check non-owner cannot redeem
      // notice the weird syntax where await preceeds expect with revert errors...
      await expect(
       perkContract.connect(wallet2).redeemPerk(0)
      ).to.be.revertedWith('Cannot redeem perk for token you dont own');

      // 3. Check owner can redeem
      await perkContract.connect(wallet1).redeemPerk(0);

      // 4. Check redeemed
      expect(await perkContract.redeemedPerks(0)).to.equal(true);

      // TODO 
      // Figure out how to break this into multiple tests with shared state.
      // I was running into weird loadFixture errors 
      // tracking here: https://github.com/NomicFoundation/hardhat/pull/2981

    }).timeout(10000);
  });
});
