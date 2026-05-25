// test mal den Einheitlichkeit von wahrschiedliche datenbanken.
import { createDB, DB, DB_SOURCES } from "./dataAccessInterface";

const firebaseDB = createDB(DB_SOURCES.firebase);
const browserDB = createDB(DB_SOURCES.browser);

const COLLECTION = "test_collection";
const TEST_DOC = {
  groupName: "test",
  timestamps: ["test", "test"],
};

const testAddAndGetById = async () => {
  return;
};

const testDataAccessInterface = async () => {
  console.log("testData: start");

  console.log("testData: clearing test collection");

  await firebaseDB.deleteAll(COLLECTION);
  await browserDB.deleteAll(COLLECTION);

  console.log("testData: querying deleted collection");

  const firebaseEmptyCol = await firebaseDB.getAll(COLLECTION);
  const browserEmptyCol = await browserDB.getAll(COLLECTION);

  if (firebaseEmptyCol.length === 0 && browserEmptyCol.length === 0) {
    console.log("testData: deleting collection PASS");
  } else {
    console.log("testData: deleting collection FAIL");
  }

  console.log("testData: adding");

  const firebaseDocIdA = await firebaseDB.add(COLLECTION, TEST_DOC);
  const browserDocIdA = await browserDB.add(COLLECTION, TEST_DOC);
  const firebaseDocIdB = await firebaseDB.add(COLLECTION, TEST_DOC);
  const browserDocIdB = await browserDB.add(COLLECTION, TEST_DOC);

  console.log("testData: Querying ");

  const fbDocA = await firebaseDB.getById(COLLECTION, firebaseDocIdA);
  const browsDocA = await browserDB.getById(COLLECTION, browserDocIdA);

  const fbDocB = await firebaseDB.getById(COLLECTION, firebaseDocIdB);
  const browsDocB = await browserDB.getById(COLLECTION, browserDocIdB);

  console.log("testData: firebaseDoc:", fbDocA);
  console.log("testData: browserDoc:", browsDocA);

  if (
    fbDocA.groupName === browsDocA.groupName &&
    fbDocB.timestamps.length === browsDocB.timestamps.length
  ) {
    console.log("testData: PASS");
  } else {
    console.error("testData: FAIL");
  }

  console.log("testData: getWhere");

  const fbGetWhereDoc = await firebaseDB.getWhere(
    COLLECTION,
    "groupName",
    "test",
  );
  const browserGetWhereDoc = await browserDB.getWhere(
    COLLECTION,
    "groupName",
    "test",
  );

  console.log("testData: firebaseDoc:", fbGetWhereDoc);
  console.log("testData: browserDoc:", browserGetWhereDoc);

  if (fbGetWhereDoc.length === browserGetWhereDoc.length) {
    console.log("testData: PASS");
  } else {
    console.error("testData: FAIL");
  }

  console.log("testData: update");

  const firebaseDBupdateDoc = await firebaseDB.update(
    COLLECTION,
    firebaseDocIdA,
    {
      name: "New Name",
    },
  );
  const browserDBUpdateDoc = await browserDB.update(COLLECTION, browserDocIdA, {
    name: "New Name",
  });

  const fbDocAfterUpdateA = await firebaseDB.getById(
    COLLECTION,
    firebaseDocIdA,
  );
  const browsDocAfterUpdateA = await browserDB.getById(
    COLLECTION,
    browserDocIdA,
  );

  console.log(fbDocAfterUpdateA, browsDocAfterUpdateA);

  if (browsDocAfterUpdateA.name === fbDocAfterUpdateA.name) {
    console.log("testData: PASS");
  } else {
    console.error("testData: FAIL");
  }

  console.log("testData: deleteById");

  const firebaseDBDeleteDocId = await firebaseDB.deleteById(
    COLLECTION,
    firebaseDocIdA,
  );
  const browsDBDeleteDocId = await browserDB.deleteById(
    COLLECTION,
    browserDocIdA,
  );

  console.log(firebaseDBDeleteDocId, browsDBDeleteDocId);

  const fbFailedDoc = await firebaseDB.getById(
    COLLECTION,
    firebaseDBDeleteDocId,
  );
  const browsFailedDoc = await browserDB.getById(
    COLLECTION,
    browsDBDeleteDocId,
  );

  await firebaseDB.deleteAll(COLLECTION);
  await browserDB.deleteAll(COLLECTION);
};

export default testDataAccessInterface;
