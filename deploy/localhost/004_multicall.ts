import {parseUnits} from 'ethers/lib/utils';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async ({deployments, getNamedAccounts, getUnnamedAccounts, ethers}) => {
  const {deploy, execute} = deployments;
  const {creator} = await getNamedAccounts();
  console.log('creator', creator);
  await deploy('Multicall', {
    from: creator,
  });
};
export default func;

func.skip = async (hre) => {
  return hre.network.name != 'localhost' && hre.network.name != 'hardhat';
};

func.tags = ['multicall'];
