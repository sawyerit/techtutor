import { describe, expect, test } from "@jest/globals";
import { Utils } from "./utils";

// chrome storge mocked in service/jest.mocks.js
describe("util class", () => {

  beforeEach(async () => {
  });

  test("puts in chrome session", async () => {
    await Utils.Instance.SetInSession("TestKey", "TestValue");
    expect(chrome.storage.session.set).toHaveBeenCalled();
  });

  test("gets from chrome session", async () => {
    await Utils.Instance.SetInSession("TestKey", "TestValue");
    const val = await Utils.Instance.GetFromSession("TestKey");
    expect(chrome.storage.session.get).toHaveBeenCalled();
    expect(val).toEqual("TestValue");
  });

  test("removes from chrome session", async () => {
    await Utils.Instance.SetInSession("TestKey", "TestValue");
    await Utils.Instance.RemoveFromSession(["TestKey"]);
    const val = await Utils.Instance.GetFromSession("TestKey");
    expect(chrome.storage.session.remove).toHaveBeenCalled();
    expect(val).toBeUndefined();
  });
});

//todo: add test for GetSkillsFromText call