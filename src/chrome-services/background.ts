import { Utils } from "../service/utils";
import {
  DefinitionObject,
  Skill,
  SkillsResponse,
  TransformedSkills,
} from "../types";

/**
 * Listen for when the extension's icon is clicked
 *
 * @remarks
 *
 * On click the float.js script is injected into the current active tab.
 *
 */
chrome.action.onClicked.addListener((tab) => {
  // Inject the content script into the current active tab
  if (tab && tab.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["static/js/float.js"], // TODO: these files probably need to be combined
    });
    //Show float window
  }
});

/**
 * Sets up the context menu to look up the job definition based on seleted text
 *
 * @remarks
 *
 * To allow for expansion, this is setup as a parent and child submenu.
 * The child menu item is only shown when there is text selected.
 *
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "DC_Parent_Menu", // Unique ID
    title: "Tech Tutor", // Context menu item title
    contexts: ["all"], // Only show when text is selected
  });

  // Sub-menu item 1
  chrome.contextMenus.create({
    id: "DC_TitleDef",
    parentId: "DC_Parent_Menu", // This makes it a sub-item of "parentMenu"
    title: "Look up title",
    contexts: ["selection"], // Only show when text is selected
  });
});

/**
 * Listens for context menu clicks
 *
 * @remarks
 *
 * Currently the only option is the get the definition of the
 * title that is currently highlighted. If the highlighted text
 * is not a title, then only the highlighted text will be displayed.
 *
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (
    tab &&
    tab.id !== undefined &&
    info.menuItemId === "DC_TitleDef" &&
    info.selectionText
  ) {
    try {
      const selectedText = info.selectionText;

      const resp = await Utils.Instance.GetTitleDefinition(selectedText);
      const defs: DefinitionObject[] = JSON.parse(resp.message);
      chrome.tabs.sendMessage(tab.id, {
        type: "titleDefinition",
        data: {
          title: selectedText,
          definition: defs.length > 0 ? defs[0].definition.value : "",
        },
      });
    } catch (error) {
      console.error("Error calling API:", error);
    }
  }
});

/**
 *  Listens for messages from the floating div (float.js) content script
 *
 * @remarks
 *
 * getSkills - takes the page raw text and returns all skills found
 * getSkillDefinition - takes a skill and returns the definition for that skill
 *
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    if (request.action === "getSkills") {
      //take in page text and return all skills
      const resp = await Utils.Instance.GetSkillsFromText(request.data);

      if (resp.error !== "") {
        sendResponse(resp);
      }

      const skillResp: SkillsResponse = JSON.parse(resp.message);
      const transformed: TransformedSkills[] = transformSkills(
        skillResp.skills
      );
      //sort the skills by length of matched source so we highlight "Data Management"
      //as a phrase and not Data & Management individually
      transformed.sort(
        (a, b) => b.matchedSource.length - a.matchedSource.length
      );

      sendResponse({ error: "", message: JSON.stringify(transformed) });
    }

    if (request.action === "getSkillDefinition") {
      const resp = await Utils.Instance.GetSkillDefinition(request.data);
      const defs: DefinitionObject[] = JSON.parse(resp.message);
      let val;
      try {
        val = defs.reduce((shortest, item) => {
          const currentValue = item.definition.value;
          return currentValue.length < shortest.length
            ? currentValue
            : shortest;
        }, defs[0].definition.value);
      } catch (error) {
        val = "Oops! We ran into a problem with this one.";
      }

      sendResponse({ error: "", message: val });
    }
  })();

  // Return true to indicate you want to send a response asynchronously
  return true;
});

/**
 *  Transform the skills from the API response into a format useful for the floating div.
 *
 * @remarks
 *
 * The data is cleaned and pivoted so that all matching source phrases have a unique entry
 * in the array along with the canonicalized version of the matched source phrase.
 *
 * @param originalSkills - The skills returned from the API
 * @returns The transformed skills
 *
 */
function transformSkills(originalSkills: Skill[]): TransformedSkills[] {
  // Helper function to clean matchedSource strings
  const cleanMatchedSource = (source: string): string => {
    return source.replace(/[\s.,/()<>_^@*\-:+$&!]+$|\s*\$.*$/g, "").trim();
  };

  // Clean and deduplicate original skills
  const cleanedSkills: Skill[] = originalSkills.map((skill) => ({
    ...skill,
    matchedSource: Array.from(
      new Set(skill.matchedSource.map(cleanMatchedSource))
    ),
  }));

  const transformedSkills: TransformedSkills[] = [];

  for (const skill of cleanedSkills) {
    for (const source of skill.matchedSource) {
      transformedSkills.push({
        matchedSource: source,
        canonicalName: skill.canonicalName,
      });
    }
  }

  // Remove duplicates based on matchedSource
  const uniqueSkills = transformedSkills.filter(
    (skill, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.matchedSource.toLowerCase() === skill.matchedSource.toLowerCase()
      )
  );

  return uniqueSkills;
}
