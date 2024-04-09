import { readFileSync } from "fs";
import { CeramicClient } from "@ceramicnetwork/http-client";
import {
  createComposite,
  readEncodedComposite,
  writeEncodedComposite,
  writeEncodedCompositeRuntime,
} from "@composedb/devtools-node";
import { Composite } from "@composedb/devtools";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays/from-string";
import ora from 'ora';
import KeyDIDResolver from "key-did-resolver";
import { randomBytes } from "crypto";
import { toString } from "uint8arrays/to-string";

const spinner = ora();
const ceramic = new CeramicClient("http://localhost:7007");

/**
 * @param {Ora} spinner - to provide progress status.
 * @return {Promise<void>} - return void when composite finishes deploying.
 */
export const writeComposite = async (spinner) => {
  await authenticate();

  const profilesSchema = readFileSync("../composites/basicprofile.graphql", {
    encoding: "utf-8",
  });

  const profileComposite = await Composite.create({
    ceramic,
    schema: profilesSchema,
  });

  const eventsSchema = readFileSync("../composites/basicevent.graphql", {
    encoding: "utf-8",
  }).replace("$PROFILE_ID", profileComposite.modelIDs[0]);

  const eventsComposite = await Composite.create({
    ceramic,
    schema: eventsSchema,
  });

  const spacesSchema = readFileSync("../composites/basicspace.graphql", {
    encoding: "utf-8",
  }).replace("$PROFILE_ID", profileComposite.modelIDs[0])
    .replace("$EVENT_ID", eventsComposite.modelIDs[1]);

  const spacesComposite = await Composite.create({
    ceramic,
    schema: spacesSchema,
  });

  const composite = Composite.from([
    profileComposite,
    eventsComposite,
    spacesComposite,
  ]);

  await writeEncodedComposite(composite, "../composites/definition.json");
  spinner.info("creating composite for runtime usage");
  await writeEncodedCompositeRuntime(
    ceramic,
    "../composites/definition.json",
    "../composites/definition.js"
  );
  spinner.info("deploying composite");
  const deployComposite = await readEncodedComposite(
    ceramic,
    "../composites/definition.js"
  );

  await deployComposite.startIndexingOn(ceramic);
  spinner.succeed("composite deployed & ready for use");
};
const generateAdminKeyDid = async () => {
  const seed = new Uint8Array(randomBytes(32));
  const keyResolver = KeyDIDResolver.getResolver();
  const did = new DID({
    provider: new Ed25519Provider(seed),
    resolver: {
      ...keyResolver,
    },
  });
  await did.authenticate();
  return {
    seed: toString(seed, "base16"),
    did,
  };
};
/**
 * Authenticating DID for publishing composite
 * @return {Promise<void>} - return void when DID is authenticated.
 */
const authenticate = async () => {
  const seed = 'cde81c67f1e61c734947be4f8f3f22c80775aa2c0be6dd11c643451deb20fc3b';
  const key = fromString(seed, "base16");

  const did = new DID({
    resolver: getResolver(),
    provider: new Ed25519Provider(key),
  });
  await did.authenticate();
  ceramic.did = did;
};
const bootstrap = async () => {
  // TODO: convert to event driven to ensure functions run in correct orders after releasing the bytestream.
  // TODO: check if .grapql files match their .json counterparts
  //       & do not create the model if it already exists & has not been updated
  try {
    console.log('going');
    spinner.info("[Composites] bootstrapping composites");
    await writeComposite(spinner)
    spinner.succeed("Composites] composites bootstrapped");
  } catch (err) {
    spinner.fail(err.message)
    ceramic.kill()
    throw err
  }
}
bootstrap().catch(console.error);
