import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async ({deployments, getNamedAccounts, wellknown}) => {
  const {deploy, execute} = deployments;
  const {creator} = await getNamedAccounts();
  console.log('> creator', creator);
  console.log('> Deploy fee distributor and swap router');

  const swapRouter = await deploy('IronSwapRouter', {
    from: creator,
    log: true,
  });

  await deploy('FeeDistributor', {
    from: creator,
    log: true,
  });

  await execute(
    'FeeDistributor',
    {from: creator, log: true},
    'initialize',
    wellknown.addresses.usdc,
    swapRouter.address
  );
};

export default func;

func.skip = async ({network}) => {
  return network.name != 'matic';
};

func.tags = ['utils'];
