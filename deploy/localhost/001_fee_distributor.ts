import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async ({deployments, getNamedAccounts, getUnnamedAccounts, ethers}) => {
  const {deploy, execute, get} = deployments;
  const {creator} = await getNamedAccounts();
  console.log('creator', creator);

  const usdc = await get('USDC');

  const swapRouter = await deploy('IronSwapRouter', {
    from: creator,
    log: true,
  });

  const feeDistributor = await deploy('FeeDistributor', {
    from: creator,
    log: true,
  });

  await execute('FeeDistributor', {from: creator, log: true}, 'initialize', usdc.address, swapRouter.address);
  await execute('FeeDistributor', {from: creator, log: true}, 'toggleOperator', creator);

  await deploy('IronSwapLib', {
    from: creator,
    log: true,
    args: [],
  });
};

export default func;

func.skip = async (hre) => {
  return hre.network.name != 'localhost' && hre.network.name != 'hardhat';
};

func.tags = ['fee-distributor'];
