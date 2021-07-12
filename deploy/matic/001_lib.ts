import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async ({deployments, getNamedAccounts, wellknown}) => {
  const {deploy, execute} = deployments;
  const {creator} = await getNamedAccounts();
  console.log('> creator', creator);
  console.log('> Deploy Shared lib');

  await deploy('IronSwapLib', {
    from: creator,
    log: true,
    args: [],
  });
};

export default func;

func.skip = async ({network}) => {
  return network.name != 'matic';
};

func.tags = ['lib'];
