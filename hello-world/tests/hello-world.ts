import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HelloWorld } from "../target/types/hello_world";
import * as assert from "assert";

describe("hello-world", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.HelloWorld as Program<HelloWorld>;

  const message = anchor.web3.Keypair.generate();
  const firstMessage = "Hello World!";

  /* it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Is callable!", async () => {
    // Add your test here.
    const tx = await program.methods.sayHello().rpc();
    console.log("Your transaction signature", tx);
  });*/

  it("Can create a message", async () => {
    await program.methods
      .createMessage(firstMessage)
      .accounts({
        message: message.publicKey,
        author: anchor.getProvider().publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([message])
      .rpc();

    const messageAccount = await program.account.message.fetch(
      message.publicKey
    );

    assert.equal(
      messageAccount.author.toBase58(),
      anchor.getProvider().publicKey.toBase58()
    );
    assert.equal(messageAccount.content, firstMessage);
    assert.ok(messageAccount.timestamp);
  });

  it("Can update a message", async () => {
    const newMessage = "Hello Chris";

    const oldMessage = await program.account.message.fetch(message.publicKey);

    console.log("old", oldMessage);

    assert.equal(oldMessage.content, firstMessage);

    await program.methods
      .updateMessage(newMessage)
      .accounts({
        message: message.publicKey,
        author: anchor.getProvider().publicKey,
      })
      .rpc();

    const messageAccount = await program.account.message.fetch(
      message.publicKey
    );

    console.log("new", messageAccount);

    assert.equal(
      messageAccount.author.toBase58(),
      anchor.getProvider().publicKey.toBase58()
    );
    assert.equal(messageAccount.content, newMessage);
    assert.ok(messageAccount.timestamp);
  });
});
