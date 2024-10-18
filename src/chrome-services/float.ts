import { ApplicationMessage, TransformedSkills } from "../types";

/**
 * Listen for messages from the background script.
 *
 * @remarks
 *
 * The information from the background script is displayed on the UI and the
 * correct UI is then displayed.
 *
 * @param message - The message sent from the background script.
 * @param message.type -  titleDefinition - This type returns the title and definition of the skill
 *  if it was found in the knowledge graph. \
 *
 */
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "titleDefinition") {
    const targetDiv = document.getElementById("titleContainer");
    const titleHeaderDiv = document.getElementById("titlesHeader");
    if (targetDiv && titleHeaderDiv) {
      targetDiv.innerText = message.data.definition;
      titleHeaderDiv.innerText = message.data.title;
      targetDiv.classList.remove("dc_none");
      openTab(null, "tabTitlesContent");
      const titlesTabButton = document.getElementById("tabTitles");
      titlesTabButton?.classList.add("active");
      //todo: there has to be a better way than hard coding all this
    }
  }
});

/**
 * The injected script that runs the chrome extension.
 *
 * @remarks
 *
 * Sets up the floating div HTML and sends the plain text of the webpage to
 * the background script for skills extraction.  The returned skills are
 * cleaned, transformed, highlighted on the page and the data is displayed
 * in the floating div.
 */
(async () => {
  // Exit if the script is running in the popup
  if (
    window.location.href.includes(
      "chrome-extension://eilnchgbjflpipgejipehcgmkfbfdmmc/index.html"
    )
  ) {
    return;
  }

  // Setup the floater
  setupUX();

  // get the plain text from the document and send to the background
  const plainText = document.body.innerText;
  console.log(plainText);

  const response: ApplicationMessage = await chrome.runtime.sendMessage({
    action: "getSkills",
    data: plainText,
  });
  if (response.error !== "") {
    alert(response.error);
  }

  // Transform the response and get a unique set of canonical names
  const returnedSkills: TransformedSkills[] = JSON.parse(response.message);
  //deduplicate array of canonical skills
  const canonicalSkills = [
    ...new Set(returnedSkills.map((skill) => skill.canonicalName)),
  ];
  canonicalSkills.sort();

  //hide the spinner
  (document.getElementById("skillLoader") as HTMLDivElement).classList.add(
    "dc_none"
  );

  //in the floating div, show the total skills found
  const total = document.getElementById("total") as HTMLDivElement;
  total.className = "dc_block dc_total";
  total.innerText = `${canonicalSkills.length} keywords found!`;

  //highlight the matched words in the document (not the canonical name)
  for (let skill of returnedSkills) {
    highlightWord(skill);
  }

  // After highlighting the terms, wire up the canonical hover popup
  const hoverItems = document.querySelectorAll(
    ".tt_term"
  ) as NodeListOf<HTMLElement>;

  hoverItems.forEach((item: HTMLElement) => {
    item.addEventListener(
      "mouseenter",
      async (event) =>
        await showCanonicalDiv(
          event,
          item.attributes.getNamedItem("data-can")?.value || ""
        )
    );
    item.addEventListener("mouseleave", hideCanonicalDiv);
  });

  //List the canonical skills in the float div
  const skillContainer = document.getElementById(
    "skillContainer"
  ) as HTMLDivElement;
  skillContainer.className = "shown dc_skillcontainer";
  for (let skill of canonicalSkills) {
    //add the skill items to the container
    const sk = document.createElement("div");
    sk.className = "dc_skillitem";
    sk.innerText = skill;
    skillContainer.appendChild(sk);
  }
})();

/**
 * Highlight the matched words in the page by replacing them with a styled <span> tag.
 *
 * @remarks
 *
 * @param word - The TransformedSkills object containing the word and canonical term
 * @param element - The element to search within. Defaults to the document body.
 *
 * @remarks
 * This function is recursive and will search through all child nodes of the element.
 * Certain tags are skipped to avoid unnecessary traversal (e.g., script, style, and mark tags).
 */
function highlightWord(word: TransformedSkills, element = document.body) {
  // Get all child nodes of the current element
  const elements = element.childNodes;

  for (let i = 0; i < elements.length; i++) {
    const child = elements[i];

    // If the child has more child nodes, recursively search within them
    if (child.nodeType === 1) {
      // Element node
      // Skip tags to avoid unnecessary traversal
      if (
        ![
          "iframe",
          "input",
          "textarea",
          "script",
          "style",
          "mark",
          "noscript",
          "form",
        ].includes(child.nodeName.toLowerCase()) &&
        !(
          child.nodeName === "SPAN" &&
          (child as HTMLSpanElement).classList.contains("tt_term")
        )
      ) {
        highlightWord(word, child as HTMLElement);
      }
    } else if (child.nodeType === 3) {
      // Text node
      const text = child.textContent;
      let regex: RegExp;
      let newText;

      // The /\+/g, "\\+" is to handle c++
      try {
        // try to highlight the original matched word
        regex = new RegExp(
          `\\b(${word.matchedSource.replace(/\+/g, "\\+")})\\b`,
          "gi"
        );
        newText = text?.replace(
          regex,
          `<span class="tt_term" data-can="${word.canonicalName}">$1</span>`
        );
      } catch (error) {
        // on regex failure, just look for the canonical name
        regex = new RegExp(
          `\\b(${word.canonicalName.replace(/\+/g, "\\+")})\\b`,
          "gi"
        );
        newText = text?.replace(
          regex,
          `<span class="tt_term" data-can="${word.canonicalName}">$1</span>`
        );
      }

      if (newText && newText !== text) {
        const newNode = document.createElement("span");
        newNode.innerHTML = newText;
        child.parentNode?.replaceChild(newNode, child);
      }
    }
  }
}

// todo: floating div (in chatgpt).
// todo: create some constants for the message passing
// todo: clean up the setupux logic its impossible to find anything

/**
 * Create the floating div, tabs, assign it CSS styling, and add the necessary
 * buttons and event listeners.
 *
 * @remarks
 *
 */
function setupUX() {
  // Create a link element for the external CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  document.head.appendChild(link);

  // Create the main floating div
  const floatingDiv = document.createElement("div");
  floatingDiv.id = "floating-div";

  // Add a title to the main div
  const title = document.createElement("div");
  title.id = "DC_Id";
  title.className = "dc_floattitle";
  title.innerHTML = "Tech Tutor";

  //Add a logo to the main div
  const logo = document.createElement("img");
  logo.className = "dc_floatlogo";
  logo.src = chrome.runtime.getURL("img/copilot.webp");
  logo.height = 30;
  logo.width = 30;
  logo.addEventListener("dragstart", (event) => {
    event.preventDefault(); // Prevent dragging the image
  });
  //add an image to the floating div
  const logodiv = document.createElement("div");
  logodiv.id = "floatimagediv";
  logodiv.appendChild(logo);

  // append the divs to the floating div
  floatingDiv.appendChild(logodiv);
  floatingDiv.appendChild(title);

  const tabParent = createTabStructure();
  //add the whole tab structure to the floating div
  floatingDiv.appendChild(tabParent);
  //add it all to the DOM
  document.body.appendChild(floatingDiv);
  
  //make the floating div draggable by the icon
  makeDraggable(floatingDiv, logodiv);

  buildCanonicalPopup();
}

/**
 * Creates and returns a tabbed HTML structure for displaying skills and titles.
 * 
 * This function generates a container element with a tabbed interface. It includes:
 * - A total skills display.
 * - Clickable tabs for 'Keywords' and 'Titles'.
 * - Content areas corresponding to each tab.
 * - A loading spinner for skills loading.
 * 
 * The structure includes:
 * - A parent div for tabs and content areas.
 * - Clickable tab div elements that switch between active tabs.
 * - Content containers that become visible upon tab activation.
 * 
 * @returns {HTMLElement} The HTML element containing the entire tabbed structure.
 */
function createTabStructure():HTMLElement {
  // Show the total number of skills found upon response
  const totalSkills = document.createElement("div");
  totalSkills.id = "total";
  totalSkills.className = "dc_floattitle dc_none";

  //holds the skill info
  const skillContainer = document.createElement("div");
  skillContainer.id = "skillContainer";
  skillContainer.className = "dc_none dc_skillcontainer";

  // holds all the title info
  const titleContainer = document.createElement("div");
  titleContainer.id = "titleContainer";
  titleContainer.className = "dc_none dc_titlecontainer";
  const jobTitleHeader = document.createElement("div");
  jobTitleHeader.id = "titlesHeader";
  jobTitleHeader.className = "dc_floattitle";

  //setup tab parent and tab container
  const tabparent = document.createElement("div");
  tabparent.className = "dc_tab_parent";
  const tabsContainer = document.createElement("div");
  tabsContainer.className = "dc_tabs";

  // Skill/Keyword clickable tab
  const tabKeywords = document.createElement("div");
  tabKeywords.id = "tabKeywords";
  tabKeywords.className = "dc_tab active";
  tabKeywords.innerHTML = "Keywords";
  tabKeywords.addEventListener("click", (event) => {
    openTab(event, "tabKeywordsContent");
  });

  // Title clickable tab
  const tabTitles = document.createElement("div");
  tabTitles.id = "tabTitles";
  tabTitles.className = "dc_tab";
  tabTitles.innerHTML = "Titles";
  tabTitles.addEventListener("click", (event) => {
    openTab(event, "tabTitlesContent");
  });

  // content area for keywords tab
  const tabKeywordsContent = document.createElement("div");
  tabKeywordsContent.id = "tabKeywordsContent";
  tabKeywordsContent.className = "dc_tab-content active";

  // content area for titles tab
  const tabTitlesContent = document.createElement("div");
  tabTitlesContent.id = "tabTitlesContent";
  tabTitlesContent.className = "dc_tab-content";

  // append tab container and clickable tabs to the tab parent
  tabparent.appendChild(tabsContainer);
  tabsContainer.appendChild(tabKeywords);
  tabsContainer.appendChild(tabTitles);

  // Loading rotator to show while the skills are loading
  const skillLoader = document.createElement("div");
  skillLoader.id = "skillLoader";
  skillLoader.className = "spinner spinnerlarge";

  //keywords UX area
  tabparent.appendChild(tabKeywordsContent);
  tabKeywordsContent.appendChild(skillLoader);
  tabKeywordsContent.appendChild(totalSkills);
  tabKeywordsContent.appendChild(skillContainer);

  //titles ux area content
  tabparent.appendChild(tabTitlesContent);
  tabTitlesContent.appendChild(jobTitleHeader);
  tabTitlesContent.appendChild(titleContainer);

  return tabparent;
}

/**
 * Enables a floating HTML element to be draggable using a designated clickable area.
 *
 * @param {HTMLElement} floatingDiv - The HTML element that will be made draggable.
 * @param {HTMLElement} logodiv - The HTML element that serves as the drag handle.
 *
 * This function adds event listeners to allow the specified floatingDiv to be dragged
 * within the document using the logodiv as the handle. The position of the floatingDiv
 * is updated as the mouse is moved, and dragging ceases when the mouse is released.
 */
function makeDraggable(floatingDiv: HTMLElement, logodiv: HTMLElement): void {
  // Variables to track mouse position
  let offsetX: number, offsetY: number;
  // Mouse down event to initiate dragging
  logodiv.addEventListener("mousedown", (e) => {
    offsetX = e.clientX - floatingDiv.getBoundingClientRect().left;
    offsetY = e.clientY - floatingDiv.getBoundingClientRect().top;

    // Add event listeners for mouse move and mouse up
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
  });

  // Mouse move event to update position
  function mouseMove(e: { clientX: number; clientY: number }) {
    floatingDiv.style.left = e.clientX - offsetX + "px";
    floatingDiv.style.top = e.clientY - offsetY + "px";
  }

  // Mouse up event to stop dragging
  function mouseUp() {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  }
}

let hideTimeout: number | null = null;

/**
 * Builds and appends a popup div for the highlighted canonical skill to the document body.

 * 
 * @function BuildCanonicalPopup
 * @returns {void} This function does not return a value.
 * 
 * @remarks 
 * This function creates a floating div element with a header and a definition section,
 * configuring its behavior when the mouse enters or leaves the div.
 *
 * @listens mouseenter Cancels the hiding of the popup upon mouse entry.
 * @listens mouseleave Triggers hiding of the popup upon mouse exit via `hideCanonicalDiv` 
 * when the mouse leaves the floating div.
 */
function buildCanonicalPopup(): void {
  //build canonical div
  const canonicalFloater = document.createElement("div");
  canonicalFloater.id = "canonicalDiv";
  const canonicalHeader = document.createElement("div");
  canonicalHeader.id = "canonicalHeader";
  canonicalHeader.className = "dc_floattitle";
  canonicalFloater.appendChild(canonicalHeader);
  const canonicalDefinition = document.createElement("div");
  canonicalDefinition.id = "canonicalDefinition";
  canonicalFloater.appendChild(canonicalDefinition);

  canonicalFloater.addEventListener("mouseenter", () => {
    // Cancel hiding when the mouse enters the floating div
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  });

  canonicalFloater.addEventListener("mouseleave", () => {
    // Hide the floating div when the mouse leaves the floating div
    hideCanonicalDiv();
  });

  document.body.appendChild(canonicalFloater);
}

// Function to show the floating div to the right-hand side of the hovered item
async function showCanonicalDiv(event: MouseEvent, content: string): Promise<void> {
  //send message to background to call skill/content api
  const response: ApplicationMessage = await chrome.runtime.sendMessage({
    action: "getSkillDefinition",
    data: content,
  });
  if (response.error !== "") {
    alert("show canonical: " + response.error);
  } else {
    const target = event.target as HTMLElement;
    // Get the floating div element that will display the content
    const canonicalDiv = document.getElementById("canonicalDiv") as HTMLElement;
    // Display the floating div and set the content
    const header = canonicalDiv.querySelector(
      "#canonicalHeader"
    ) as HTMLElement;
    header.innerText = content;

    const definition = canonicalDiv.querySelector(
      "#canonicalDefinition"
    ) as HTMLElement;
    definition.innerHTML = response.message;

    // Position the floating div to the right-hand side of the hovered item
    const rect = target.getBoundingClientRect();
    canonicalDiv.style.top = `${rect.top - 250 + window.scrollY}px`;
    canonicalDiv.style.left = `${
      rect.right - rect.width / 2 - 150 + window.scrollX
    }px`;

    canonicalDiv.classList.remove("dc_hidden");
    canonicalDiv.classList.add("dc_visible");

    // Clear any pending timeout to hide the floating div
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }
}

// Function to hide the floating div
function hideCanonicalDiv(): void {
  hideTimeout = window.setTimeout(() => {
    const canonicalDiv = document.getElementById("canonicalDiv") as HTMLElement;
    canonicalDiv.classList.remove("dc_visible");
    canonicalDiv.classList.add("dc_hidden");
  }, 500); // Short delay to account for mouse transition
}

function openTab(event: MouseEvent | null, tabName: string): void {
  // Hide all tab contents
  const tabContents = document.querySelectorAll(".dc_tab-content");
  tabContents.forEach((content) => {
    content.classList.remove("active");
  });

  // Remove active class from all tabs
  const tabs = document.querySelectorAll(".dc_tab");
  tabs.forEach((tab) => {
    tab.classList.remove("active");
  });

  // Show the clicked tab content
  const tab: HTMLElement | null = document.getElementById(tabName);
  if (tab) {
    tab.classList.add("active");
  }

  // Add active class to the clicked tab
  if (event && event.currentTarget) {
    (event.currentTarget as HTMLElement).classList.add("active");
  }
}
