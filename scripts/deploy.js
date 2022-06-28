async function main() {
  const [owner, somebodyElse] = await hre.ethers.getSigners();
  const keyboardsContractFactory = await hre.ethers.getContractFactory("Keyboards");
  const keyboardsContract = await keyboardsContractFactory.deploy();
  await keyboardsContract.deployed();

  const keyboardTxn = await keyboardsContract.create(0, true, "sepia");
  await keyboardTxn.wait();

  // const keyboardTx2 = await keyboardsContract.connect(somebodyElse).create(1, false, "grayscale");
  // await keyboardTx2.wait();

  const tipTxn = await keyboardsContract.tip(0 ,{value: hre.ethers.utils.parseEther("0.001")});
  const tipTxnReceipt = await tipTxn.wait();
  console.log(tipTxnReceipt.events);

  keyboards = await keyboardsContract.getKeyboards();
  console.log("We got the keyboards!", keyboards);

  // keyboards = await keyboardsContract.connect(somebodyElse).getKeyboards();
  // console.log("And as somebody else!", keyboards);  // for using different connection
}

  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
    