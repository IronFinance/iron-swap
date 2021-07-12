import {constants, Contract} from 'ethers';
import {parseUnits} from 'ethers/lib/utils';
import {ethers} from 'hardhat';

const dec18 = (x: number) => parseUnits(x.toFixed(18), 18);
const dec6 = (x: number) => parseUnits(x.toFixed(6), 6);

const printBalance = async (contracts: Contract[], holder: string) => {
  const data = await Promise.all(contracts.map((t) => t.balanceOf(holder)));
  data.map((t) => t.toString()).forEach((t, i) => console.log(contracts[i].address, t));
};

const main = async () => {
  const [alice, bob] = await ethers.getUnnamedSigners();
  const swapRouter = await ethers.getContract('IronSwapRouter');
  const triPool = await ethers.getContract('3pool');
  const zIronPool = await ethers.getContract('zIronPool');
  const zIronAddress: string = await zIronPool.getLpToken();
  const zIronLp = await ethers.getContractAt('LPToken', zIronAddress);

  const usdt = await ethers.getContract('USDT');
  const usdc = await ethers.getContract('USDC');
  const iron = await ethers.getContract('IRON');

  await (await usdc.connect(alice).approve(swapRouter.address, constants.MaxUint256)).wait();
  await (await usdt.connect(alice).approve(swapRouter.address, constants.MaxUint256)).wait();
  await (await iron.connect(alice).approve(swapRouter.address, constants.MaxUint256)).wait();

  console.log('before', alice.address);
  await printBalance([usdc, usdt, iron], alice.address);
  console.log(dec18(5).toString());

  const deadline = Math.floor(Date.now() / 1000 + 3600);
  let tx = await swapRouter.connect(alice).addLiquidity(
    zIronPool.address, // meta pool
    triPool.address, // basePool,
    [0, dec18(5)], // meta pool amount
    [dec6(10), dec6(10), 0], // base pool amount
    0, // min output,
    deadline
  );

  let receipt = await tx.wait();
  console.log(receipt.events);

  console.log('after');
  await printBalance([usdc, usdt, iron, zIronLp], alice.address);

  console.log('removeLiquidity');
  await (await zIronLp.connect(alice).approve(swapRouter.address, constants.MaxUint256)).wait();
  tx = await swapRouter.connect(alice).removeLiquidity(
    zIronPool.address, // meta pool
    triPool.address, // basePool,
    dec18(20),
    [0, 0], // meta pool amount
    [0, 0, 0], // base pool amount
    deadline
  );

  receipt = await tx.wait();
  console.log(receipt.events);
  await printBalance([usdc, usdt, iron, zIronLp], alice.address);

  const creator = await ethers.getNamedSigner('creator');
  const zDollarPool = await ethers.getContract('3pool');
  await (await zDollarPool.connect(creator).withdrawAdminFee()).wait();
  await (await zIronPool.connect(creator).withdrawAdminFee()).wait();

  const feeDistributor = await ethers.getContract('FeeDistributor');
  console.log('Fee distributor balance');
  await printBalance([usdc, usdt, iron], feeDistributor.address);

  await (await feeDistributor.connect(creator).swap()).wait();

  console.log('Fee distributor balance');
  await printBalance([usdc, usdt, iron], feeDistributor.address);
};

main().catch(console.error);
